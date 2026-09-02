export type BehaviorEnvelope = {
  eventId: string;
  eventType: string;
  version: number;
  occurredAt: string; // ISO
  customerId?: string | null;
  anonymousId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
  variantId?: string | null;
  properties?: Record<string, unknown>;
};

export async function sendBehaviorEvent(envelope: BehaviorEnvelope) {
  try {
    await fetch('/api/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope),
      keepalive: true,
    });
  } catch (err) {
    // swallow errors in UI
    // eslint-disable-next-line no-console
    console.warn('Failed to send behavior event', err);
  }
}
