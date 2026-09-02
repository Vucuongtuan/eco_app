import json
import logging
import aio_pika
from app.config import settings
from app.models.schemas import BehaviorEventEnvelope

logger = logging.getLogger(__name__)


async def start_consumer(data_loader) -> aio_pika.RobustConnection:
    connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
    channel = await connection.channel()
    await channel.set_qos(prefetch_count=20)

    exchange = await channel.declare_exchange(
        settings.RABBITMQ_EXCHANGE, aio_pika.ExchangeType.TOPIC, durable=True
    )
    dlx = await channel.declare_exchange(
        settings.RABBITMQ_DLX, aio_pika.ExchangeType.TOPIC, durable=True
    )
    dlq = await channel.declare_queue(settings.RABBITMQ_DLQ, durable=True)
    await dlq.bind(dlx, routing_key=settings.RABBITMQ_DEAD_ROUTING_KEY)

    queue = await channel.declare_queue(
        settings.RABBITMQ_CONSUME_QUEUE,
        durable=True,
        arguments={
            "x-dead-letter-exchange": settings.RABBITMQ_DLX,
            "x-dead-letter-routing-key": settings.RABBITMQ_DEAD_ROUTING_KEY,
        },
    )
    await queue.bind(exchange, routing_key=settings.RABBITMQ_BINDING_ROUTING_KEY)

    async def on_message(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            try:
                payload = json.loads(message.body)
                event = BehaviorEventEnvelope(**payload)
                await data_loader.record_event(event)
            except Exception:
                logger.exception("Failed to process message, sending to DLQ")
                raise

    await queue.consume(on_message)
    logger.info("RabbitMQ consumer started on queue %s", settings.RABBITMQ_CONSUME_QUEUE)
    return connection
