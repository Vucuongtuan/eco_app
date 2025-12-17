"use client";

import { Media } from "@/components/Media";
import { ProductCard } from "@/components/ProductList/ProductCard";
import { RichText } from "@/components/RichText";
import { Product } from "@/payload-types";
import { Lang } from "@/types";
import { useWindowSize } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Media as MediaType } from "@/payload-types";

interface ListProductProps {
  gap?: number;
  data: Product[];
  enableMedia?: boolean;
  media?: string | MediaType;
  caption?: any;
  lang?: string;
}

export default function CarouselListProduct(props: ListProductProps) {
  const { data: d, lang, enableMedia, media, caption } = props;
  const {width} = useWindowSize() 
  const data = d.length < 5 ? [...d, ...d, ...d] : [...d, ...d];
  const isDesktop = useMemo(() => (width ?? 0) > 1023, [width]);
  const ITEMS_PER_VIEW = isDesktop ? 3.5 : 2.2;

  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slideCount = data.length;
  const maxSlide = Math.max(0, slideCount - ITEMS_PER_VIEW);

  const onPrevClick = useCallback(() => {
    if (currentSlide > 0) {
      const next = Math.max(Math.floor(currentSlide - 0.01), 0);
      setCurrentSlide(next);
    }
  }, [currentSlide]);

  const onNextClick = useCallback(() => {
    if (currentSlide < maxSlide) {
      const next = Math.min(currentSlide + 1, maxSlide);
      setCurrentSlide(next);
    }
  }, [currentSlide, maxSlide]);

  return (
    <>
      <div className="flex-1  mx-auto px-2">
        <div className="relative flex">
          {/* Media View */}
          {enableMedia && media && (
            <aside className="relative aspect-figcard w-[23%] mr-4 max-lg:hidden">
              <Media resource={media} fClassName="w-full h-full object-cover" fill imgSize="large" />
              {caption && (
                <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-lg font-semibold">
                  <RichText data={caption as any} className="text-white" enableProse={false} enableGutter={false} />
                </div>
                </>
              )}
            </aside>
          )}
          {/* Carousel Track */}
          <div className="flex-1 overflow-hidden">
          <motion.ul
            className="flex"
            animate={{
              x: `-${currentSlide * (100 / ITEMS_PER_VIEW)}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {data.map((item, idx) => (
              <li
                key={`${item.id}-${idx}`}
                className="shrink-0 box-border px-1"
                style={{ width: `${100 / ITEMS_PER_VIEW}%` }}
              >
                <ProductCard doc={item as Product} lang={lang as Lang} />
              </li>
            ))}
          </motion.ul>
          </div>
        </div>
      </div>
      <div className=" absolute top-8 lg:top-12 right-5 md:right-7 flex gap-4">
        <button
          type="button"
          onClick={onPrevClick}
          disabled={currentSlide === 0}
          className=" md:w-10 md:h-10 w-8 h-8 rounded-full bg-[#202124] flex items-center justify-center hover:bg-[#303134] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          type="button"
          onClick={onNextClick}
          disabled={currentSlide === maxSlide}
          className=" md:w-10 md:h-10 w-8 h-8 rounded-full bg-[#202124] flex items-center justify-center hover:bg-[#303134] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </>
  );
}
