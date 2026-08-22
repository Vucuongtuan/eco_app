import { ColorSwatches } from "@/components/common";
import type { Product } from "@/lib/shopify/types";

type ProductColorSelectorProps = {
  product: Product;
};

export function ProductColorSelector({ product }: ProductColorSelectorProps) {
  const colorProducts = [...(product.colorSiblings?.references.nodes ?? []), product]
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);

  if (colorProducts.length <= 1) return null;

  return (
    <fieldset>
      <legend className="mb-3 text-xs uppercase tracking-[0.2em]">Color</legend>
      <ColorSwatches
        items={colorProducts.map((item) => {
          const colorLabel = item.title.split(" - ").at(-1) ?? item.title;
          const colorValue = item.color?.value ?? colorLabel;
          const selected = item.id === product.id;
          const variantId = item.variants?.nodes.find((variant) => variant.availableForSale)?.id ?? item.variants?.nodes[0]?.id;
          const href = variantId ? `/products/${item.handle}?variant=${encodeURIComponent(variantId)}` : `/products/${item.handle}`;

          return { id: item.id, label: colorLabel, value: colorValue, href, selected };
        })}
      />
    </fieldset>
  );
}
