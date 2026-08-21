import type { Product } from "@/lib/shopify/types";
import { ColorSwatches } from "@/components/common";
import { ProductPurchaseControls } from "./ProductPurchaseControls";

type ProductDetailInfoProps = { product: Product };

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const colorProducts = [...(product.colorSiblings?.references.nodes ?? []), product]
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);

    console.log({colorProducts});
    
  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-500">{product.productType}</p>
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{product.title}</h1>
        {colorProducts.length > 1 ? <fieldset className="mt-6">
          <legend className="mb-3 text-xs uppercase tracking-[0.2em]">Color</legend>
          <ColorSwatches items={colorProducts.map((item) => {
              const colorLabel = item.title.split(" - ").at(-1) ?? item.title;
              const colorValue = item.color?.value ?? colorLabel;
              const selected = item.id === product.id;
              const variantId = item.variants?.nodes.find((variant) => variant.availableForSale)?.id ?? item.variants?.nodes[0]?.id;
              const href = variantId ? `/products/${item.handle}?variant=${encodeURIComponent(variantId)}` : `/products/${item.handle}`;
              return { id: item.id, label: colorLabel, value: colorValue, href, selected };
            })} />
        </fieldset> : null}
        <ProductPurchaseControls variants={product.variants.nodes} fallbackPrice={product.priceRange.minVariantPrice} />
      </header>

      {product.descriptionHtml ? (
        <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      ) : null}

    </div>
  );
}
