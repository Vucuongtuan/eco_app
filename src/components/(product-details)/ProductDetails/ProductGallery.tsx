import { Media } from "@/components/Media";
import type { Media as MediaType, Product } from "@/payload-types";
import { ProductGalleryCarousel } from "./ProductGalleryCarousel";

interface ProductGalleryProps {
  currentData: Product["gallery"];
}

export function ProductGallery({ currentData }: ProductGalleryProps) {
  if (!currentData || currentData.length === 0 || !currentData[0].image)
    return null;

  const images: MediaType[] = (
    Array.isArray(currentData[0]?.image) ? currentData[0].image : currentData
  ).filter((item): item is MediaType => typeof item !== "number");

  return (
    <>
      {/* Desktop Grid View */}
      <aside className="hidden lg:block w-3/5">
        <div className="w-full h-auto relative grid grid-cols-2 gap-[2px]">
          {images.map((m: MediaType, index: number) => (
            <Media
              key={index}
              resource={m}
              fill
              fClassName="aspect-figStyle w-full h-full relative"
              imgClassName="object-cover"
              imgSize={"large"}
            />
          ))}
        </div>
      </aside>

      {/* Mobile/Tablet Carousel View */}
      <div className="lg:hidden w-full">
        <ProductGalleryCarousel currentData={currentData} />
      </div>
    </>
  );
}
