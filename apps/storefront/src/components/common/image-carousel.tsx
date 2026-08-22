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
  showControls?: boolean;
  showDots?: boolean;
};

function preload(url?: string) {
  if (!url || typeof window === "undefined") return;
  const image = new window.Image();
  image.src = url;
}

export const ImageCarousel = memo(function ImageCarousel({ images, alt, href, resetKey, showControls = true, showDots = false }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const slides = useMemo(() => images.length ? images : [{ url: "", altText: alt, width: null, height: null }], [alt, images]);

  useEffect(() => setIndex(0), [resetKey]);

  useEffect(() => {
    // Prime the first transition as soon as the card mounts. The visible image
    // is still rendered by Next Image, while this warms the browser cache for
    // the first next-slide click.
    preload(slides[0]?.url);
    preload(slides[1]?.url);
  }, [slides]);

  const preloadAdjacent = () => {
    preload(slides[(index + 1) % slides.length]?.url);
    preload(slides[(index - 1 + slides.length) % slides.length]?.url);
  };

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={preloadAdjacent}
      onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStart === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
        if (Math.abs(distance) > 40) setIndex((current) => (current + (distance < 0 ? 1 : -1) + slides.length) % slides.length);
        setTouchStart(null);
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, slideIndex) => {
            const blurDataURL = thumbhashToDataUrl(slide.thumbhash);
            const content = slide.url ? <NextImage src={slide.url} alt={slide.altText ?? alt} fill sizes="(min-width: 768px) 25vw, 50vw" loading={slideIndex < 2 ? "eager" : "lazy"} quality={75} placeholder={blurDataURL ? "blur" : "empty"} blurDataURL={blurDataURL} className="object-cover" /> : null;
            return <div key={`${slide.url}-${slideIndex}`} className="relative h-full min-w-full">
              {href ? <Link href={href} aria-label={`View ${alt}`} className="absolute inset-0">{content}</Link> : content}
            </div>;
          })}
        </div>
      </div>
      {slides.length > 1 ? <>
        {showControls ? <>
          <button type="button" aria-label="Previous image" onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)} className="pointer-events-none absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">‹</button>
          <button type="button" aria-label="Next image" onClick={() => setIndex((current) => (current + 1) % slides.length)} className="pointer-events-none absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">›</button>
        </> : null}
        {showDots ? <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1" aria-label={`Image ${index + 1} of ${slides.length}`}>
          {slides.map((slide, dotIndex) => <span key={`${slide.url}-dot-${dotIndex}`} className={`size-1.5 rounded-full ${dotIndex === index ? "bg-white" : "bg-white/50"}`} />)}
        </div> : null}
      </> : null}
    </div>
  );
});
