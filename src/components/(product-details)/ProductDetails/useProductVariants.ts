import { Product, Variant } from "@/payload-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useProductVariants(doc: Product) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const variants =
    (doc.variants?.docs?.filter((v) => typeof v === "object") as Variant[]) ||
    [];

  // Color
  const colorVariants =
    doc.gallery?.filter(
      (item) =>
        item.variantOption &&
        typeof item.variantOption === "object" &&
        item.variantOption.variantType &&
        typeof item.variantOption.variantType === "object" &&
        item.variantOption.variantType.name === "color"
    ) || [];
  console.log({ colorVariants });

  const [selectedColor, setSelectedColor] = useState<any | null>(() => {
    const variantParam = searchParams.get("variant");
    if (variantParam && colorVariants.length > 0) {
      const foundItem = colorVariants.find((item) => {
        const option = item.variantOption as any;
        return option?.value === variantParam || option?.label === variantParam;
      });
      return foundItem?.variantOption || null;
    }
    return colorVariants.length > 0
      ? (colorVariants[0].variantOption as any)
      : null;
  });
  const handleColorChange = (colorOption: any) => {
    setSelectedColor(colorOption);
    const params = new URLSearchParams(window.location.search);
    if (colorOption.id !== (colorVariants[0].variantOption as any).id) {
      params.set("variant", colorOption.label);
    } else {
      params.delete("variant");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  // Size
  const sizeVariantType = doc.variantTypes?.find(
    (vt) => typeof vt === "object" && vt.name === "size"
  );
  const sizeVariants =
    sizeVariantType &&
    typeof sizeVariantType === "object" &&
    sizeVariantType.options &&
    "docs" in sizeVariantType.options
      ? (sizeVariantType.options.docs as any[])
      : [];
  const [selectedSize, setSelectedSize] = useState<any | null>(() => {
    const sizeParam = searchParams.get("size");
    if (sizeParam && sizeVariants.length > 0) {
      const foundSize = sizeVariants.find((s) => s.value === sizeParam);
      return foundSize || sizeVariants[0];
    }

    if (sizeVariants.length > 0) {
      // Smart Default: Find first size with inventory > 0 for the selected color (or default color)
      // Note: selectedColor might not be fully initialized here if it depends on state, 
      // but we initialized it with a function so we can replicate that logic or use the result if we were inside an effect.
      // However, useState initializers run once. selectedColor is also state.
      // We need to determine the effective color here to check stock.
      
      let effectiveColor = null;
      const variantParam = searchParams.get("variant");
      if (variantParam && colorVariants.length > 0) {
        const foundItem = colorVariants.find((item) => {
          const option = item.variantOption as any;
          return option?.value === variantParam || option?.label === variantParam;
        });
        effectiveColor = foundItem?.variantOption || null;
      } else if (colorVariants.length > 0) {
        effectiveColor = colorVariants[0].variantOption as any;
      }

      if (effectiveColor) {
        const firstInStockSize = sizeVariants.find((size) => {
           const matchingVariant = variants.find((v) => {
             const hasColor = v.options?.some((opt: any) => opt.id === effectiveColor.id);
             const hasSize = v.options?.some((opt: any) => opt.id === size.id);
             return hasColor && hasSize;
           });
           return matchingVariant && (matchingVariant.inventory || 0) > 0;
        });
        if (firstInStockSize) return firstInStockSize;
      }
      
      return sizeVariants[0];
    }
    return null;
  });
  const handleSizeChange = (size: any) => {
    setSelectedSize(size);
    const params = new URLSearchParams(window.location.search);
    if (size.id !== sizeVariants[0].id) {
      params.set("size", size.value.toUpperCase());
    } else {
      params.delete("size");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const allMatchingVariants = variants.filter((variant) => {
        const hasColor = variant.options?.some(
          (opt) => (opt as any)?.id === selectedColor.id
        );
        const hasSize = variant.options?.some(
          (opt) => (opt as any)?.id === selectedSize.id
        );
        return hasColor && hasSize;
      });

      const bestMatch = allMatchingVariants.sort(
        (a, b) => (b.options?.length || 0) - (a.options?.length || 0)
      )[0];

      setSelectedVariant(bestMatch || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor?.id, selectedSize?.id]);

  return {
    variants,
    colorVariants,
    sizeVariants,
    selectedColor,
    selectedSize,
    selectedVariant,
    handleColorChange,
    handleSizeChange,
  };
}
