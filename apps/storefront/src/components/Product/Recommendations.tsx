"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchRecommendations } from '@/lib/recommend';
import { getOrCreateAnonId, getCustomerId } from '@/lib/session';

type Rec = { product_id: string; score?: number };

export function Recommendations({ title = 'Recommended for you', limit = 6 }: { title?: string; limit?: number }) {
  const [items, setItems] = useState<Rec[]>([]);

  useEffect(() => {
    const uid = getCustomerId() || getOrCreateAnonId();
    if (!uid) return;
    void (async () => {
      const resp = await fetchRecommendations({ user_id: uid, limit });
      if (!resp) return;
      // support different response shapes
      const recs = resp.recommendations ?? resp.recommendations?.recommendations ?? resp;
      // normalize to array of {product_id, score}
      const normalized: Rec[] = (recs || []).map((r: any) => ({ product_id: r.product_id ?? r.productId ?? r.id ?? r, score: r.score ?? r.s ?? 0 }));
      setItems(normalized.slice(0, limit));
    })();
  }, [limit]);

  if (!items.length) return null;

  return (
    <section className="px-6 py-8">
      <h2 className="px-12 mb-6 text-xl font-medium">{title}</h2>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => (
          <li key={it.product_id}>
            <Link href={`/products/${it.product_id}`} className="block rounded-sm border p-3 text-sm hover:bg-gray-50">{it.product_id}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
