"use client";

import { useState } from "react";
import type { Money, ProductVariant } from "@/lib/shopify/types";

export function ProductPurchaseControls({ variants, fallbackPrice }: { variants: ProductVariant[]; fallbackPrice: Money }) {
  const firstAvailable = variants.find((variant) => variant.availableForSale)?.id ?? variants[0]?.id;
  const [selectedVariant, setSelectedVariant] = useState(firstAvailable);
  const variant = variants.find((item) => item.id === selectedVariant) ?? variants[0];
  const price = variant?.price ?? fallbackPrice;

  return <>
    <p className="mt-4 text-lg">{price.amount} {price.currencyCode}</p>
    {variants.length ? <fieldset>
      <legend className="mb-3 text-xs uppercase tracking-[0.2em]">Size</legend>
      <div className="grid grid-cols-4 gap-2">
        {variants.map((item) => <button key={item.id} type="button" disabled={!item.availableForSale} onClick={() => setSelectedVariant(item.id)} className={`border px-3 py-3 text-sm transition-colors ${selectedVariant === item.id ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"} ${!item.availableForSale ? "cursor-not-allowed text-gray-300 line-through" : ""}`}>{item.title}</button>)}
      </div>
    </fieldset> : null}
    <button type="button" className="w-full bg-black px-5 py-4 text-sm uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-75">Add to bag</button>
  </>;
}
