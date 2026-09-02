export function pushGtmEvent(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  // ensure dataLayer exists
  // eslint-disable-next-line no-unused-expressions
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push(event);
}
