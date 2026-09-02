import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { BehaviorEventType } from './types/behavior-event.type.js';
import { CreateEventDto } from './dto/create-event.dto.js';

describe('EventsController', () => {
  let controller: EventsController;
  const create = vi.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: { create },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    create.mockReset();
  });

  it('delegates creation to the service', async () => {
    const payload: CreateEventDto = {
      event: BehaviorEventType.PRODUCT_VIEWED,
      sessionId: 'session_xyz',
      productId: 'gid://shopify/Product/456',
    };

    create.mockResolvedValue({
      accepted: true,
      eventId: '123e4567-e89b-12d3-a456-426614174000',
    });

    const result = await controller.create(payload);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(payload);

    expect(result).toEqual({
      accepted: true,
      eventId: '123e4567-e89b-12d3-a456-426614174000',
    });
  });
});