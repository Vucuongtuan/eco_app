import { Variant } from "@/payload-types";

export function getDisplayPrice(
  product: any,
  selectedVariant?: Variant | null
) {
  const basePrice = product.priceInUSDEnabled && product.priceInUSD;
  if (!basePrice)
    return {
      amount:
        (selectedVariant?.priceInUSDEnabled && selectedVariant?.priceInUSD) ||
        0,
    };
  if (
    selectedVariant?.priceInUSDEnabled &&
    selectedVariant.priceInUSD != null
  ) {
    const variantPrice = selectedVariant.priceInUSD;

    if (variantPrice < basePrice) {
      const discountPercent = Math.round(
        ((basePrice - variantPrice) / basePrice) * 100
      );

      return {
        amount: variantPrice,
        originalAmount: basePrice,
        discountPercent,
      };
    }

    return {
      amount: variantPrice,
    };
  }

  // fallback: base price
  return {
    amount: basePrice,
  };
}
