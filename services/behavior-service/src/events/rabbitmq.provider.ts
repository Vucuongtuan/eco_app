import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type HealthIndicatorResult } from '@nestjs/terminus';
import { connect, type AmqpConnectionManager } from 'amqp-connection-manager';
import { type Channel } from 'amqplib';
import {
  RABBITMQ_DEAD_ROUTING_KEY,
  RABBITMQ_DLX,
  RABBITMQ_DLQ,
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
  RABBITMQ_ROUTING_KEY,
} from './constants/rabbitmq.constants.js';
import { BehaviorEventEnvelope } from './types/event-envelope.type.js';

export const RABBITMQ_PROVIDER = 'RABBITMQ_PROVIDER';

interface RabbitMqConnectionLike {
  isConnected(): boolean;
}

@Injectable()
export class RabbitMqHealthIndicator {
  constructor(@Inject(RABBITMQ_PROVIDER) private readonly rabbitMqProvider: RabbitMqConnectionLike) {}

  isHealthy(key: string): HealthIndicatorResult {
    const isHealthy = this.rabbitMqProvider.isConnected();

    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...(isHealthy ? {} : { message: 'RabbitMQ connection is not currently open' }),
      },
    };
  }
}

@Injectable()
export class RabbitMqProvider implements OnModuleInit, OnApplicationShutdown {
  private static readonly DEFAULT_RABBITMQ_URL = 'amqp://moon:moon_secret@localhost:5672/moon';

  private readonly logger = new Logger(RabbitMqProvider.name);

  private readonly connection: AmqpConnectionManager;

  private readonly confirmChannel: ReturnType<AmqpConnectionManager['createChannel']>;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    const rabbitMqUrl = this.configService.get<string>('RABBITMQ_URL', RabbitMqProvider.DEFAULT_RABBITMQ_URL);

    this.connection = connect(rabbitMqUrl);
    this.confirmChannel = this.connection.createChannel({
      setup: async (channel: Channel): Promise<void> => {
        await channel.assertExchange(RABBITMQ_DLX, 'topic', { durable: true });
        await channel.assertQueue(RABBITMQ_DLQ, { durable: true });
        await channel.bindQueue(RABBITMQ_DLQ, RABBITMQ_DLX, RABBITMQ_DEAD_ROUTING_KEY);

        await channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(RABBITMQ_QUEUE, {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': RABBITMQ_DLX,
            'x-dead-letter-routing-key': RABBITMQ_DEAD_ROUTING_KEY,
          },
        });
        await channel.bindQueue(RABBITMQ_QUEUE, RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY);
      },
    });

    this.connection.on('connect', () => {
      this.logger.log('RabbitMQ connection established');
    });

    this.connection.on('disconnect', (error: Error | undefined) => {
      const errorMessage = error instanceof Error ? error.message : 'unknown disconnect reason';
      this.logger.error(`RabbitMQ connection lost: ${errorMessage}`);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.confirmChannel.waitForConnect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.connection.close();
  }

  isConnected(): boolean {
    return this.connection.isConnected();
  }

  async publish(envelope: BehaviorEventEnvelope): Promise<void> {
    const payload = Buffer.from(JSON.stringify(envelope));

    try {
      await this.confirmChannel.publish(RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY, payload, {
        persistent: true,
        contentType: 'application/json',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `RabbitMQ publish failed for eventId=${envelope.eventId}, eventType=${envelope.eventType}, sessionId=${envelope.sessionId}: ${message}`,
      );
      throw error;
    }
  }
}
