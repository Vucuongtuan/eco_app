"use client";

import { useState } from "react";
import Link from "next/link";
import { ColorSwatches, ImageCarousel } from "@/components/common";
import { WishlistButton } from "@/components/WishlistButton";
import { cn } from "@/lib/cn";
import type { Image as ProductImage, Money } from "@/lib/shopify/types";

export type ProductCardVariant = {
  id: string;
  href?: string;
  title?: string;
  price: Money;
  image?: ProductImage | null;
  images?: ProductImage[];
  selectedOptions?: Array<{ name: string; value: string }>;
  sizes?: Array<{ label: string; available: boolean }>;
  color?: { label: string; value?: string };
};

export type ProductCardProps = {
  title: string;
  href: string;
  image?: ProductImage | null;
  price?: Money;
  variants?: ProductCardVariant[];
  className?: string;
};

function getColor(variant: ProductCardVariant) {
  if (variant.color) return variant.color;
  const option = variant.selectedOptions?.find((item) => item.name.toLowerCase() === "color");
  return option ? { label: option.value, value: option.value } : undefined;
}

export function ProductCard({ title, href, image, price, variants, className }: ProductCardProps) {
  const firstVariant = variants?.[0];
  const [activeVariant, setActiveVariant] = useState<ProductCardVariant | undefined>(firstVariant);

  if (!firstVariant) return null;
  if (!activeVariant) return null;

  const colors = (variants ?? []).filter((variant, index, all) => {
    const color = getColor(variant)?.value ?? getColor(variant)?.label;
    return color && all.findIndex((item) => (getColor(item)?.value ?? getColor(item)?.label) === color) === index;
  });
  const activeImage = activeVariant.image ?? image;
  const activePrice = activeVariant.price ?? price;
  const activeHref = activeVariant.href ?? href;
  const activeTitle = activeVariant.title ?? title;
  
  return (
    <article className={cn("group min-w-0 motion-safe:animate-[card-fade-in_500ms_ease-out_both] motion-reduce:animate-none", className)}>
      <div className="relative aspect-[4/6] overflow-hidden bg-[#f3eee9]">
        <WishlistButton productId={activeVariant.href ?? href} />
        <ImageCarousel images={activeVariant.images ?? (activeImage ? [activeImage] : [])} alt={activeTitle} href={activeHref} resetKey={activeVariant.id} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-white/95 px-4 py-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            {(activeVariant.sizes ?? []).map((size) => <span key={size.label} className={cn("text-center", !size.available && "text-gray-300 line-through")}>{size.label}</span>)}
          </div>
        </div>
      </div>
      <h3 className=" px-2 mt-3 text-sm font-medium"><Link href={activeHref} className="transition-colors hover:text-gray-600">{activeTitle}</Link></h3>
      {activePrice ? <p className=" px-2  mt-1 text-sm text-gray-600">{activePrice.currencyCode} {activePrice.amount}</p> : null}
      {colors.length > 1 ? <div className="px-2 mt-3"><ColorSwatches items={colors.map((variant) => ({ id: variant.id, label: getColor(variant)?.label ?? "Color", value: getColor(variant)?.value ?? getColor(variant)?.label ?? "#808080", selected: variant.id === activeVariant.id }))} onSelect={(item) => { const variant = colors.find((colorVariant) => colorVariant.id === item.id); if (variant) setActiveVariant(variant); }} /></div> : null}

    </article>
  );
}
