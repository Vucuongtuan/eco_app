export function getOrCreateAnonId() {
  if (typeof window === 'undefined') return null;
  try {
    let id = localStorage.getItem('anonId');
    if (!id) {
      id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `anon-${Date.now()}-${Math.random()}`;
      localStorage.setItem('anonId', id);
    }
    return id;
  } catch (err) {
    return null;
  }
}

export function getCustomerId() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('customerId') || null;
  } catch (err) {
    return null;
  }
}
