import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { EventsController, HealthController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { RabbitMqHealthIndicator, RabbitMqProvider, RABBITMQ_PROVIDER } from './rabbitmq.provider.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TerminusModule],
  controllers: [EventsController, HealthController],
  providers: [
    EventsService,
    { provide: RABBITMQ_PROVIDER, useClass: RabbitMqProvider },
    RabbitMqHealthIndicator,
  ],
})
export class EventsModule {}
