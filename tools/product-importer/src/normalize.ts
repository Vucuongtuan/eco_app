import { normalizedProductSchema, type NormalizedProduct } from "./schema.ts";
import { classifyProduct, extractAttributes, styleGroupFromTitle, type ClassificationDiagnostics } from "./taxonomy.ts";

type SourceVariant = {
  id: number; title: string; sku?: string; barcode?: string | null; price: string;
  compare_at_price?: string | null; available: boolean; requires_shipping?: boolean;
  taxable?: boolean; grams?: number; featured_image?: { src: string; alt?: string | null } | null;
  option1?: string | null; option2?: string | null; option3?: string | null;
};
type SourceImage = { src: string; alt?: string | null; width?: number; height?: number };
export type SourceProduct = {
  id: number; handle: string; title: string; body_html?: string; vendor?: string;
  product_type?: string; tags?: string[]; variants?: SourceVariant[]; images?: SourceImage[];
  published_at?: string; updated_at?: string;
};

export type NormalizationResult = { product: NormalizedProduct; diagnostics: ClassificationDiagnostics };

export function normalizeProductWithDiagnostics(product: SourceProduct): NormalizationResult {
  const variants = product.variants ?? [];
  const originalTags = product.tags ?? [];
  const { classification, collections, normalizedTags, diagnostics } = classifyProduct(product.title, originalTags);
  const descriptionHtml = product.body_html ?? "";
  const attributes = extractAttributes(product.title, descriptionHtml);
  const attributeTags = [
    attributes.color ? `color:${attributes.color}` : null,
    ...attributes.materials.map((material) => `material:${material}`),
  ].filter((tag): tag is string => Boolean(tag));

  const normalized = normalizedProductSchema.parse({
    source: {
      productId: String(product.id),
      originalTags,
      publishedAt: product.published_at ?? null,
      updatedAt: product.updated_at ?? null,
    },
    identity: {
      handle: product.handle,
      title: product.title.trim(),
      styleGroup: styleGroupFromTitle(product.title),
    },
    classification,
    merchandising: {
      collections,
      tags: [...new Set([...normalizedTags, ...attributeTags])],
      status: "DRAFT",
    },
    attributes,
    descriptionHtml,
    commerce: {
      currency: "SGD",
      basePrice: variants.length ? Math.min(...variants.map((variant) => Number(variant.price))) : -1,
    },
    images: (product.images ?? []).map((image) => ({
      url: image.src.startsWith("//") ? `https:${image.src}` : image.src,
      alt: image.alt ?? null, width: image.width ?? null, height: image.height ?? null,
    })),
    variants: variants.map((variant) => ({
      sourceId: String(variant.id), title: variant.title, sku: variant.sku ?? "",
      barcode: variant.barcode ?? null,
      price: Number(variant.price),
      compareAtPrice: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
      available: variant.available,
      requiresShipping: variant.requires_shipping ?? true,
      taxable: variant.taxable ?? true,
      weightGrams: variant.grams ?? 0,
      image: variant.featured_image ? {
        url: variant.featured_image.src.startsWith("//") ? `https:${variant.featured_image.src}` : variant.featured_image.src,
        alt: variant.featured_image.alt ?? null,
      } : null,
      options: [variant.option1, variant.option2, variant.option3].filter((value): value is string => Boolean(value)),
    })),
  });
  return { product: normalized, diagnostics };
}

export function normalizeProduct(product: SourceProduct): NormalizedProduct {
  return normalizeProductWithDiagnostics(product).product;
}
