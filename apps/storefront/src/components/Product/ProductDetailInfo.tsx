import type { Product } from "@/lib/shopify/types";
import { ProductPurchaseControls } from "./ProductPurchaseControls";
import { ProductColorSelector } from "./ProductColorSelector";

type ProductDetailInfoProps = { product: Product };

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  return (
    <div className="flex flex-col gap-12">
      <header className="space-y-6">
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{product.title}</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{product.productType}</p>
        <ProductColorSelector product={product} />
        <ProductPurchaseControls variants={product.variants.nodes} fallbackPrice={product.priceRange.minVariantPrice} />
      </header>

      {product.descriptionHtml ? (
        <div
          className="prose prose-sm max-w-none leading-7 text-gray-600 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-3 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      ) : null}

    </div>
  );
}
