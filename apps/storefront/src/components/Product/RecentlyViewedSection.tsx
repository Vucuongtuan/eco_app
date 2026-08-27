"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/Card";
import type { ProductCard as ProductCardData } from "@/lib/shopify/types";

const STORAGE_KEY = "eco-recently-viewed-products";

type RecentlyViewedSectionProps = {
  product: ProductCardData;
};

export function RecentlyViewedSection({ product }: RecentlyViewedSectionProps) {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ProductCardData[];
      setProducts(stored.filter((item) => item.handle !== product.handle).slice(0, 4));
      localStorage.setItem(STORAGE_KEY, JSON.stringify([product, ...stored.filter((item) => item.handle !== product.handle)].slice(0, 12)));
    } catch {
      setProducts([]);
    }
  }, [product]);

  if (!products.length) return null;

  return (
    <section className="mx-auto pb-16  lg:pb-24" aria-labelledby="recently-viewed-title">
      <h2 id="recently-viewed-title" className="px-12 mb-8 text-xl font-medium tracking-tight sm:text-2xl">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-x-0.5 gap-y-10 lg:grid-cols-4">
        {products.map((item) => {
          const variant = item.variants?.nodes[0];
          if (!variant) return null;

          return (
            <ProductCard
              key={item.id}
              title={item.title}
              href={`/products/${item.handle}`}
              image={item.featuredImage}
              price={item.priceRange.minVariantPrice}
              variants={[{ id: variant.id, title: item.title, href: `/products/${item.handle}`, price: variant.price, image: variant.image ?? item.featuredImage, sizes: (item.variants?.nodes ?? []).map((entry) => ({ label: entry.selectedOptions.find((option) => option.name.toLowerCase() === "size")?.value ?? entry.title, available: entry.availableForSale })) }]}
            />
          );
        })}
      </div>
    </section>
  );
}
