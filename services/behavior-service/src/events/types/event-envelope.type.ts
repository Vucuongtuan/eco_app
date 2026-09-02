import { BehaviorEventType } from './behavior-event.type.js';

export interface BehaviorEventEnvelope {
  eventId: string;
  eventType: BehaviorEventType;
  version: 1;
  occurredAt: string;
  customerId?: string | null;
  anonymousId?: string | null;
  sessionId: string;
  productId?: string | null;
  variantId?: string | null;
  properties?: Record<string, unknown>;
}
