import "server-only";
import { storefrontRequest } from "./client";
import { IMAGE_FRAGMENT, MONEY_FRAGMENT, PRODUCT_CARD_FRAGMENT, PRODUCT_VARIANT_FRAGMENT } from "./fragments";
import type { PageInfo, Product, ProductCard } from "./types";

const PRODUCTS_QUERY = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query Products($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...ProductCard }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PRODUCT_QUERY = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductCard
      descriptionHtml
      detailImages: images(first: 20) { nodes { ...ShopifyImage } }
      variants(first: 100) { nodes { ...ProductVariantFields } }
      color: metafield(namespace: "custom", key: "color") { value }
      colorSiblings: metafield(namespace: "custom", key: "color_siblings") {
        references(first: 20) {
          nodes {
            ... on Product {
              ...ProductCard
              color: metafield(namespace: "custom", key: "color") { value }
            }
          }
        }
      }
    }
  }
`;

export type GetProductsOptions = {
  first?: number;
  after?: string;
  query?: string;
  sortKey?: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "PRODUCT_TYPE" | "RELEVANCE" | "TITLE" | "UPDATED_AT";
  reverse?: boolean;
};

export async function getProducts(options: GetProductsOptions = {}) {
  return fetchProducts(options);
}

export async function getProductsUncached(options: GetProductsOptions = {}) {
  return fetchProducts(options, { cache: "no-store" });
}

async function fetchProducts(options: GetProductsOptions = {}, requestOptions?: { cache: "no-store" }) {
  const first = Math.min(Math.max(options.first ?? 24, 1), 100);
  const data = await storefrontRequest<{
    products: { nodes: ProductCard[]; pageInfo: PageInfo };
  }, Record<string, unknown>>(PRODUCTS_QUERY, {
    first,
    after: options.after,
    query: options.query,
    sortKey: options.sortKey,
    reverse: options.reverse,
  }, requestOptions ?? { tags: ["shopify-products"] });
  return data.products;
}

export async function getProduct(handle: string) {
  const data = await storefrontRequest<{ product: (Product & { detailImages: { nodes: Product["images"]["nodes"] } }) | null }, { handle: string }>(
    PRODUCT_QUERY,
    { handle },
    undefined,
  );
  if (!data.product) return null;

  return { ...data.product, images: data.product.detailImages };
}
