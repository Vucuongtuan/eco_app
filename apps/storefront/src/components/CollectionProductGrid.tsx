"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductCard, type ProductCardVariant } from "@/components/Card";
import { getCollectionProductsAction } from "@/services/actions";
import type { ProductCard as ProductCardData } from "@/lib/shopify/types";

type ProductPage = {
  nodes: ProductCardData[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

type CollectionProductGridProps = {
  handle: string;
  initialData: ProductPage;
};

function titleParts(title: string) {
  const parts = title.split(" - ");
  return parts.length > 1 ? { base: parts.slice(0, -1).join(" - "), color: parts.at(-1) ?? title } : { base: title, color: title };
}

function getCardVariants(products: ProductCardData[]): ProductCardVariant[] {
  return products.reduce<ProductCardVariant[]>((result, item) => {
    const color = item.color?.value ?? titleParts(item.title).color;
    const representative = item.variants?.nodes[0];
    if (!representative || result.some((variant) => variant.color?.label === color)) return result;
    result.push({
      id: representative.id,
      href: `/products/${item.handle}`,
      title: item.title,
      price: representative.price,
      image: item.featuredImage,
      images: item.images?.nodes,
      color: { label: color, value: color },
      sizes: item.variants?.nodes.map((variant) => ({
        label: variant.selectedOptions.find((option) => option.name.toLowerCase() === "size")?.value ?? variant.title,
        available: variant.availableForSale,
      })),
    });
    return result;
  }, []);
}

function groupProducts(products: ProductCardData[]) {
  const groups = new Map<string, ProductCardData[]>();
  for (const product of products) {
    const key = product.styleGroup?.value ?? titleParts(product.title).base;
    groups.set(key, [...(groups.get(key) ?? []), product]);
  }
  return [...groups.values()];
}

export function CollectionProductGrid({ handle, initialData }: CollectionProductGridProps) {
  const query = useInfiniteQuery({
    queryKey: ["collection-products", handle],
    initialPageParam: undefined as string | undefined,
    initialData: { pages: [initialData], pageParams: [undefined] },
    queryFn: ({ pageParam }) => getCollectionProductsAction(handle, 24, pageParam),
    getNextPageParam: (lastPage) => lastPage?.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
  });
  const products = query.data?.pages.flatMap((page) => page.nodes) ?? [];
  const groups = groupProducts(products);

  return <>
    <ul className="grid grid-cols-2 gap-x-1 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {groups.map((items) => {
        const product = items[0];
        return <li key={product.styleGroup?.value ?? product.id}>
          <ProductCard
            href={`/products/${product.handle}`}
            title={titleParts(product.title).base}
            image={product.featuredImage}
            price={product.priceRange.minVariantPrice}
            variants={getCardVariants(items)}
          />
        </li>;
      })}
    </ul>
    {query.hasNextPage ? <button type="button" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} className="mx-auto mt-12 block border border-gray-900 px-6 py-3 text-sm disabled:opacity-50">
      {query.isFetchingNextPage ? "Loading..." : "Load more"}
    </button> : null}
  </>;
}
