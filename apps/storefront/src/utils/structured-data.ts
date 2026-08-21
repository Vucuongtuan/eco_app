export type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdValue = JsonLdPrimitive | JsonLdValue[] | { [key: string]: JsonLdValue };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export type ProductJsonLdInput = {
  name: string;
  url: string;
  image?: string;
  description?: string;
  sku?: string;
  price?: string;
  currency?: string;
  availability?: boolean;
};

export function productJsonLd(product: ProductJsonLdInput): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: product.url,
    ...(product.image ? { image: [product.image] } : {}),
    ...(product.description ? { description: product.description } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.price && product.currency ? {
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability === false ? "OutOfStock" : "InStock"}`,
        url: product.url,
      },
    } : {}),
  };
}

export function collectionJsonLd(collection: { name: string; url: string; description?: string }): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    url: collection.url,
    ...(collection.description ? { description: collection.description } : {}),
  };
}

export function websiteJsonLd(site: { name: string; url: string; description?: string }): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    ...(site.description ? { description: site.description } : {}),
  };
}
