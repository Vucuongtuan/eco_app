import { getBlogs, getBlog, getCollections, getPages, getProductsUncached } from "@/lib/shopify";

import type { MetadataRoute } from "next";

import { cacheLife, cacheTag } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

async function getCachedCollectionsForSitemap() {
  "use cache";

  cacheLife("max");
  return getCollections();
}

async function getCachedProductsForSitemap() {
  "use cache";
  cacheLife("max");
  return getProductsUncached({}, true);
}

async function getCachedPagesForSitemap() {
  "use cache";

  cacheLife("max");
  return getPages();
}

async function getCachedBlogsForSitemap() {
  "use cache";

  cacheLife("max");

  const blogs = await getBlogs();

  const blogsWithArticles = await Promise.all(
    blogs.nodes.map(async (blog) => {
      const data = await getBlog(blog.handle, 100);

      return {
        ...blog,
        articles: data?.articles?.nodes ?? [],
      };
    }),
  );

  return blogsWithArticles;
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  //Sitemap size limits: All formats limit a single sitemap to 50MB (uncompressed) or 50,000 URLs
  const [collections, products] = await Promise.all([
    getCachedCollectionsForSitemap(),
    getCachedProductsForSitemap(),
  ]);

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },

    ...(collections?.nodes ?? []).map((collection) => ({
      url: `${BASE_URL}/collections/${collection.handle}`,
      lastModified: collection.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),

    ...(products?.nodes ?? []).map((product) => ({
      url: `${BASE_URL}/products/${product.handle}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
