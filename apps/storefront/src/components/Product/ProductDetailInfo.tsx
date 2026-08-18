"use client";

import { useState } from "react";
import type { Product } from "@/lib/shopify/types";

type ProductDetailInfoProps = { product: Product };

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const sizes = product.variants.nodes;
  const firstAvailable = sizes.find((variant) => variant.availableForSale)?.id ?? sizes[0]?.id;
  const [selectedVariant, setSelectedVariant] = useState(firstAvailable);
  const variant = sizes.find((item) => item.id === selectedVariant) ?? sizes[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-500">{product.productType}</p>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{product.title}</h1>
        <p className="mt-4 text-lg">{price.amount} {price.currencyCode}</p>
      </div>

      {product.descriptionHtml ? (
        <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      ) : null}

      {sizes.length ? (
        <fieldset>
          <legend className="mb-3 text-xs uppercase tracking-[0.2em]">Size</legend>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={!item.availableForSale}
                onClick={() => setSelectedVariant(item.id)}
                className={`border px-3 py-3 text-sm transition-colors ${selectedVariant === item.id ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"} ${!item.availableForSale ? "cursor-not-allowed text-gray-300 line-through" : ""}`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <button type="button" className="w-full bg-black px-5 py-4 text-sm uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-75">
        Add to bag
      </button>
    </div>
  );
}
