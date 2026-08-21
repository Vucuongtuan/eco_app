"use server";

import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { getCollection, getCollectionUncached, getCollections, getCurrentCustomer, getMetaobjects, getMenu, getProduct, getProducts, getProductsUncached, type CurrentCustomer, type ProductCard } from "@/lib/shopify";
import { getFeaturedSections, type HomeContent } from "@/lib/shopify/cms";

const MENU_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{0,254}$/;

async function getCachedProduct(handle: string) {
  "use cache";

  cacheLife("days");
  cacheTag("shopify-products", `shopify-product:${handle}`);
  return getProduct(handle);
}

export async function getProductAction(handle: string) {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!MENU_HANDLE_PATTERN.test(normalizedHandle)) {
    throw new Error("Invalid Shopify product handle");
  }
  return getCachedProduct(normalizedHandle);
}

async function getCachedMenu(handle: string) {
  "use cache";

  cacheLife("max");
  cacheTag("shopify-menus", `shopify-menu:${handle}`);
  return getMenu(handle);
}

export async function getMenuAction(handle: string) {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!MENU_HANDLE_PATTERN.test(normalizedHandle)) {
    throw new Error("Invalid Shopify menu handle");
  }
  return getCachedMenu(normalizedHandle);
}

export async function getMainMenuAction() {
  return getCachedMenu("main-menu");
}

export async function getTrendingProductsAction(): Promise<ProductCard[]> {
  const products = await getProductsUncached({ first: 6, sortKey: "BEST_SELLING" });
  return products.nodes;
}

export async function searchProductsAction(query: string) {
  return getProductsUncached({ first: 48, query: query.trim() });
}

async function getCachedCollections(first: number) {
  "use cache";

  cacheLife("days");
  cacheTag("shopify-collections");
  return getCollections(first);
}

export async function getCollectionsAction(first = 20) {
  return getCachedCollections(Math.min(Math.max(first, 1), 100));
}

async function getCachedCollection(handle: string, first: number, after?: string) {
  "use cache";

  cacheLife("days");
  cacheTag("shopify-collections", `shopify-collection:${handle}`, "shopify-products");
  if (handle === "all") {
    const products = await getProducts({ first, after });
    return { id: "all", handle: "all", title: "All Products", description: "", image: null, products };
  }
  return getCollection(handle, first, after);
}

export async function getCollectionAction(handle: string, first = 24, after?: string) {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!MENU_HANDLE_PATTERN.test(normalizedHandle)) {
    throw new Error("Invalid Shopify collection handle");
  }
  return getCachedCollection(normalizedHandle, Math.min(Math.max(first, 1), 100), after);
}

export async function getCollectionProductsAction(handle: string, first = 24, after?: string) {
  const collection = handle === "all"
    ? await getProductsUncached({ first, after }).then((products) => ({ products }))
    : after ? await getCollectionUncached(handle, first, after) : await getCollectionAction(handle, first);
  return collection ? { nodes: collection.products.nodes, pageInfo: collection.products.pageInfo } : { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
}

export async function getHomeContent(): Promise<HomeContent> {
  "use cache";

  cacheLife("max");
  cacheTag("shopify-cms", "shopify-cms:home");

  const [featuredLinks, featuredSections, cards, cardGrids, contentSections] = await Promise.all([
    getMetaobjects("home_featured_link"),
    getFeaturedSections(),
    getMetaobjects("card"),
    getMetaobjects("card_array"),
    getMetaobjects("home_content_section"),
  ]);

  return { featuredLinks, featuredSections, cards, cardGrids, contentSections };
}

export async function getAccountVisuals() {
  const entry = (await getMetaobjects("account_page", 1))[0];
  return {
    loginImage: entry?.references.login_image ?? null,
    registerImage: entry?.references.register_image ?? null,
  };
}

export async function getCurrentCustomerAction(): Promise<CurrentCustomer | null> {
  const token = (await cookies()).get("shopify_customer_access_token")?.value;
  if (!token) return null;
  try {
    return await getCurrentCustomer(token);
  } catch {
    return null;
  }
}
