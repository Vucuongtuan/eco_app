import { Lang } from "@/types";
import Link from "next/link";

interface SizeSelectorProps {
  sizes: any;
  sizeId: string;
  slug: string;
  lang: Lang;
  variantSelect: string;
}

export const SizeSelector = ({
  sizes,
  sizeId,
  slug,
  lang,
  variantSelect,
}: SizeSelectorProps) => {
  const sizeOrder = ["S", "M", "L", "XL", "XXL"];
  const cleanDataSize = (sizes as any[])?.filter((size: any) => {
    return size.options?.find((option: any) => option.variantType === sizeId);
  });

  if (!cleanDataSize || !cleanDataSize?.length) return null;

  const mapSizeForVariantSelect = cleanDataSize.filter((v: any) =>
    v.options?.find((option: any) => option.label === variantSelect)
  );

  const sortedData = [...mapSizeForVariantSelect].sort((a, b) => {
    const sizeA = a.options
      .find((o: any) => o.variantType === sizeId)
      ?.value.toUpperCase();
    const sizeB = b.options
      .find((o: any) => o.variantType === sizeId)
      ?.value.toUpperCase();
    return sizeOrder.indexOf(sizeA) - sizeOrder.indexOf(sizeB);
  });
  return (
    <div className="hidden group-hover:block absolute bottom-0 left-0 w-full h-1/12 text-xs font-medium tracking-wide">
      <div className="w-full h-full flex justify-center items-center gap-6 lg:gap-6 xl:gap-10">
        {sortedData.map(({ _status, options, inventory }, idx) => {
          if (!_status) return null;
          const matchingSize = options.find(
            (option: any) => option.variantType === sizeId
          );
          // const sizeData = (cleanDataSize as any)?.[key];
          const hasStock = inventory > 0;
          return (
            <Link
              href={`/${lang}/products/${slug}?size=${matchingSize.value}&variant=${variantSelect}`}
              key={idx}
              className={`text-xs md:text-lg lg:text-base xl:text-lg ${hasStock ? "text-white cursor-pointer" : "text-white/60 cursor-not-allowed line-through"}`}
            >
              {matchingSize.value.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
