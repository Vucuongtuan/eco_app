"use client";

import { useState } from "react";
import { useCartStore } from "@/context/zustand.provider";
import type { Money, ProductVariant } from "@/lib/shopify/types";

const sizeLabels: Record<string, string> = {
  XS: "Extra Small",
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "Extra Large",
};

function getSize(variant: ProductVariant) {
  return variant.selectedOptions.find((option) => option.name.toLowerCase() === "size")?.value ?? variant.title;
}

export function ProductPurchaseControls({ variants, fallbackPrice }: { variants: ProductVariant[]; fallbackPrice: Money }) {
  const firstAvailable = variants.find((variant) => variant.availableForSale)?.id ?? variants[0]?.id;
  const [selectedVariant, setSelectedVariant] = useState(firstAvailable);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCart = useCartStore((store) => store.setCart);
  const variant = variants.find((item) => item.id === selectedVariant) ?? variants[0];
  const price = variant?.price ?? fallbackPrice;
  const selectedSize = variant ? getSize(variant) : null;

  async function addToCart() {
    if (!variant?.availableForSale || isAdding) return;
    setIsAdding(true);
    setError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ merchandiseId: variant.id, quantity: 1 }),
      });
      const data = await response.json() as { cart?: import("@/lib/shopify/types").Cart; error?: string };
      if (!response.ok || !data.cart) throw new Error(data.error ?? "Unable to add item to cart.");
      setCart(data.cart);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to add item to cart.");
    } finally {
      setIsAdding(false);
    }
  }

  return <>
    <p className=" space-y-2 text-lg">{price.amount} {price.currencyCode}</p>
    {variants.length ? <fieldset>
      <legend className="mb-3 text-xs  tracking-[0.2em]">
        Size{selectedSize ? `: ${sizeLabels[selectedSize] ?? selectedSize}` : ""}
      </legend>
      <div className="flex gap-2">
        {variants.map((item) => {
          return(
            <button key={item.id} 
              type="button" 
              disabled={!item.availableForSale} 
              onClick={() => setSelectedVariant(item.id)} 
              className={`border aspect-video px-6 py-3 text-sm transition-colors ${selectedVariant === item.id ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"} ${!item.availableForSale ? "cursor-not-allowed text-gray-300 line-through" : ""}`}
              >
             {getSize(item)}
          </button>
          )
        })}
      </div>
    </fieldset> : null}
    <button type="button" disabled={!variant?.availableForSale || isAdding} onClick={addToCart} className="w-full bg-black px-5 py-4 text-sm uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50">{isAdding ? "Adding..." : "Add to bag"}</button>
    {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
  </>;
}
