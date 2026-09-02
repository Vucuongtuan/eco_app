import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CreateEventDto } from './dto/create-event.dto.js';
import { BehaviorEventType } from './types/behavior-event.type.js';
import { EventsService } from './events.service.js';

describe('EventsService', () => {
  let service: EventsService;
  const publish = vi.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: 'RABBITMQ_PROVIDER',
          useValue: {
            publish,
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    publish.mockReset();
  });

  it('builds an event envelope and accepts the event after broker confirmation', async () => {
    publish.mockResolvedValue(undefined);

    const payload: CreateEventDto = {
      event: BehaviorEventType.PRODUCT_VIEWED,
      customerId: 'gid://shopify/Customer/123',
      anonymousId: 'anonymous_abc',
      sessionId: 'session_xyz',
      productId: 'gid://shopify/Product/456',
      variantId: null,
      properties: {},
      occurredAt: '2026-09-01T10:00:00.000Z',
    };

    const result = await service.create(payload);

    expect(result.accepted).toBe(true);
    expect(result.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(publish).toHaveBeenCalledTimes(1);
    const envelope = publish.mock.calls[0][0];
    expect(envelope.eventType).toBe(BehaviorEventType.PRODUCT_VIEWED);
    expect(envelope.version).toBe(1);
    expect(envelope.sessionId).toBe('session_xyz');
  });

  it('throws when the broker does not confirm the publish', async () => {
    publish.mockRejectedValue(new Error('confirm timeout'));

    await expect(
      service.create({
        event: BehaviorEventType.CART_ADDED,
        sessionId: 'session_abc',
        productId: 'gid://shopify/Product/456',
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
