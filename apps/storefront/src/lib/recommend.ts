import type { BehaviorEnvelope } from './behavior';

export type RecommendRequest = {
  user_id: string;
  limit?: number;
  exclude_products?: string[];
  include_explanation?: boolean;
};

export async function fetchRecommendations(req: RecommendRequest) {
  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to fetch recommendations', err);
    return null;
  }
}
