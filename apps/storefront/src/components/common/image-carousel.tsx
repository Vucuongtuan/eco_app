"use client";

import Link from "next/link";
import NextImage from "next/image";
import { memo, useEffect, useMemo, useState } from "react";
import type { Image as CarouselImage } from "@/lib/shopify/types";
import { thumbhashToDataUrl } from "@/lib/thumbhash";

type ImageCarouselProps = {
  images: CarouselImage[];
  alt: string;
  href?: string;
  resetKey?: string;
};

function preload(url?: string) {
  if (!url || typeof window === "undefined") return;
  const image = new window.Image();
  image.src = url;
}

export const ImageCarousel = memo(function ImageCarousel({ images, alt, href, resetKey }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const slides = useMemo(() => images.length ? images : [{ url: "", altText: alt, width: null, height: null }], [alt, images]);

  useEffect(() => setIndex(0), [resetKey]);

  const preloadAdjacent = () => {
    preload(slides[(index + 1) % slides.length]?.url);
    preload(slides[(index - 1 + slides.length) % slides.length]?.url);
  };

  const image = slides[index] ?? slides[0];
  const blurDataURL = thumbhashToDataUrl(image.thumbhash);
  const content = image.url ? <NextImage src={image.url} alt={image.altText ?? alt} fill sizes="(min-width: 768px) 25vw, 50vw" loading="lazy" quality={75} placeholder={blurDataURL ? "blur" : "empty"} blurDataURL={blurDataURL} className="object-cover" /> : null;

  return (
    <div className="absolute inset-0" onMouseEnter={preloadAdjacent}>
      {href ? <Link href={href} aria-label={`View ${alt}`} className="absolute inset-0">{content}</Link> : content}
      {slides.length > 1 ? <>
        <button type="button" aria-label="Previous image" onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)} className="pointer-events-none absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">‹</button>
        <button type="button" aria-label="Next image" onClick={() => setIndex((current) => (current + 1) % slides.length)} className="pointer-events-none absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">›</button>
      </> : null}
    </div>
  );
});
