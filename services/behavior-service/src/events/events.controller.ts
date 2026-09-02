import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { CreateEventDto } from './dto/create-event.dto.js';
import { EventsService } from './events.service.js';
import { RabbitMqHealthIndicator } from './rabbitmq.provider.js';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@Body() createEventDto: CreateEventDto): Promise<{ accepted: true; eventId: string }> {
    return this.eventsService.create(createEventDto);
  }
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly rabbitMqHealthIndicator: RabbitMqHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.rabbitMqHealthIndicator.isHealthy('rabbitmq'),
    ]);
  }
}
