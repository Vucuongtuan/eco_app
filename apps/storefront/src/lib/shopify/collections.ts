import "server-only";
import { storefrontRequest } from "./client";
import { IMAGE_FRAGMENT, MONEY_FRAGMENT, PRODUCT_CARD_FRAGMENT, PRODUCT_VARIANT_FRAGMENT } from "./fragments";
import type { Collection, PageInfo, ProductCard } from "./types";

const COLLECTIONS_QUERY = `
  ${IMAGE_FRAGMENT}
  query Collections($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: TITLE) {
      nodes { id handle title description image { ...ShopifyImage } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const COLLECTION_QUERY = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query Collection($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id handle title description image { ...ShopifyImage }
      products(first: $first, after: $after) {
        nodes {
          ...ProductCard
          color: metafield(namespace: "moon", key: "color") { value }
          styleGroup: metafield(namespace: "moon", key: "style_group") { value }
          colorSiblings: metafield(namespace: "moon", key: "color_siblings") {
            references(first: 20) {
              nodes {
                ... on Product {
                  ...ProductCard
                  color: metafield(namespace: "moon", key: "color") { value }
                }
              }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export async function getCollections(first = 20, after?: string) {
  const data = await storefrontRequest<{
    collections: { nodes: Collection[]; pageInfo: PageInfo };
  }, Record<string, unknown>>(COLLECTIONS_QUERY, {
    first: Math.min(Math.max(first, 1), 100),
    after,
  }, { tags: ["shopify-collections"] });
  return data.collections;
}

export async function getCollection(handle: string, first = 24, after?: string) {
  return fetchCollection(handle, first, after);
}

export async function getCollectionUncached(handle: string, first = 24, after?: string) {
  return fetchCollection(handle, first, after, { cache: "no-store" });
}

async function fetchCollection(handle: string, first = 24, after?: string, options?: { cache: "no-store" }) {
  const data = await storefrontRequest<{
    collection: (Collection & { products: { nodes: ProductCard[]; pageInfo: PageInfo } }) | null;
  }, Record<string, unknown>>(COLLECTION_QUERY, {
    handle,
    first: Math.min(Math.max(first, 1), 100),
    after,
  }, options ?? { tags: ["shopify-collections", `shopify-collection:${handle}`, "shopify-products"] });
  return data.collection;
}
