import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateEventDto } from './dto/create-event.dto.js';
import { RABBITMQ_PROVIDER, RabbitMqProvider } from './rabbitmq.provider.js';
import { BehaviorEventEnvelope } from './types/event-envelope.type.js';

export interface AcceptedEventResponse {
  accepted: true;
  eventId: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject(RABBITMQ_PROVIDER)
    private readonly rabbitMqProvider: RabbitMqProvider,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<AcceptedEventResponse> {
    const eventId = uuidv4();
    const occurredAt = createEventDto.occurredAt ?? new Date().toISOString();

    const envelope: BehaviorEventEnvelope = {
      eventId,
      eventType: createEventDto.event,
      version: 1,
      occurredAt,
      customerId: createEventDto.customerId,
      anonymousId: createEventDto.anonymousId,
      sessionId: createEventDto.sessionId,
      productId: createEventDto.productId,
      variantId: createEventDto.variantId,
      properties: createEventDto.properties,
    };

    this.logger.log(
      `event received: eventType=${envelope.eventType}, sessionId=${envelope.sessionId}`,
    );

    try {
      await this.rabbitMqProvider.publish(envelope);
      this.logger.log(`event published and confirmed: eventId=${eventId}`);

      return { accepted: true, eventId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `publish failure: eventId=${eventId}, eventType=${envelope.eventType}, sessionId=${envelope.sessionId}, error=${message}`,
      );
      throw new ServiceUnavailableException(
        `Unable to confirm event publication for ${envelope.eventType}.`,
      );
    }
  }
}
