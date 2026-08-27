"use server";

import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { getArticle, getBlog, getCollection, getCollectionUncached, getCollections, getCurrentCustomer, getMetaobjects, getMenu, getPage, getPages, getProduct, getProducts, getProductsUncached, type CurrentCustomer, type ProductCard } from "@/lib/shopify";
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

async function getCachedTrendingProducts() {
  "use cache";

  cacheLife("minutes");
  cacheTag("shopify-products", "shopify-products:trending");
  return getProducts({ first: 6, sortKey: "BEST_SELLING" });
}

export async function getTrendingProductsAction(): Promise<ProductCard[]> {
  const products = await getCachedTrendingProducts();
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

export type CollectionParams = {
  first?: number;
  after?: string;
  filters?: Record<string, unknown>[];
  sortKey?: string;
  reverse?: boolean;
};

async function getCachedCollection(handle: string, params?: CollectionParams) {
  "use cache";

  cacheLife("minutes");
  cacheTag("shopify-collections", `shopify-collection:${handle}`, "shopify-products");
  if (handle === "all") {
    const products = await getProducts({ first: params?.first ?? 24, after: params?.after });
    return { id: "all", handle: "all", title: "All Products", description: "", image: null, products: { nodes: products.nodes, filters: [], pageInfo: products.pageInfo } };
  }
  return getCollection(handle, params);
}

export async function getCollectionAction(handle: string, params?: CollectionParams) {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!MENU_HANDLE_PATTERN.test(normalizedHandle)) {
    throw new Error("Invalid Shopify collection handle");
  }
  return getCachedCollection(normalizedHandle, params);
}

export async function getCollectionProductsAction(handle: string, params?: CollectionParams) {
  const collection = handle === "all"
    ? await getProductsUncached({ first: params?.first ?? 24, after: params?.after }).then((products) => ({ products: { nodes: products.nodes, filters: [], pageInfo: products.pageInfo } }))
    : params?.after ? await getCollectionUncached(handle, params) : await getCollectionAction(handle, params);
  return collection ? { nodes: collection.products.nodes, filters: collection.products.filters, pageInfo: collection.products.pageInfo } : { nodes: [], filters: [], pageInfo: { hasNextPage: false, endCursor: null } };
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

async function getCachedPage(handle: string) {
  "use cache";

  cacheLife("days");
  cacheTag("shopify-pages", `shopify-page:${handle}`);
  return getPage(handle);
}

export async function getPageAction(handle: string) {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!MENU_HANDLE_PATTERN.test(normalizedHandle)) {
    throw new Error("Invalid Shopify page handle");
  }
  return getCachedPage(normalizedHandle);
}

export async function getPagesAction() {
  return getPages();
}

async function getCachedBlog(handle: string, first = 12, after?: string) {
  "use cache";

  cacheLife("days");
  cacheTag("shopify-blogs", `shopify-blog:${handle}`);
  return getBlog(handle, first, after);
}

export async function getBlogAction(handle: string, first = 12, after?: string) {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!MENU_HANDLE_PATTERN.test(normalizedHandle)) {
    throw new Error("Invalid Shopify blog handle");
  }
  return getCachedBlog(normalizedHandle, first, after);
}

async function getCachedArticle(blogHandle: string, articleHandle: string) {
  "use cache";

  cacheLife("days");
  cacheTag("shopify-blogs", `shopify-blog:${blogHandle}`, `shopify-article:${articleHandle}`);
  return getArticle(blogHandle, articleHandle);
}

export async function getArticleAction(blogHandle: string, articleHandle: string) {
  const normBlog = blogHandle.trim().toLowerCase();
  const normArticle = articleHandle.trim().toLowerCase();
  if (!MENU_HANDLE_PATTERN.test(normBlog) || !MENU_HANDLE_PATTERN.test(normArticle)) {
    throw new Error("Invalid Shopify blog or article handle");
  }
  return getCachedArticle(normBlog, normArticle);
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
