import { z } from "zod";

const productTypeSchema = z.enum([
  "top", "t-shirt", "shirt", "blouse", "dress", "skirt", "jumpsuit", "knitwear", "outerwear",
  "shorts", "trousers", "jeans", "bag", "hat", "scarf", "accessory", "unknown",
]);

export const normalizedProductSchema = z.object({
  source: z.object({
    productId: z.string().min(1),
    originalTags: z.array(z.string()),
    publishedAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
  }),
  identity: z.object({
    handle: z.string().min(1),
    title: z.string().min(1),
    styleGroup: z.string().min(1),
  }),
  classification: z.object({
    gender: z.enum(["men", "women", "kids", "unisex", "unknown"]),
    department: z.enum(["tops", "bottoms", "one-piece", "accessories", "unknown"]),
    productType: productTypeSchema,
    categoryPath: z.array(z.string().min(1)),
    shopifyTaxonomyId: z.string().min(1).nullable(),
  }),
  merchandising: z.object({
    collections: z.array(z.string().min(1)),
    tags: z.array(z.string().min(1)),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  }),
  attributes: z.object({
    color: z.string().nullable(),
    materials: z.array(z.string()),
    fit: z.string().nullable(),
    styles: z.array(z.string()),
  }),
  descriptionHtml: z.string(),
  commerce: z.object({
    currency: z.literal("SGD"),
    basePrice: z.number().nonnegative(),
  }),
  images: z.array(z.object({
    url: z.url(), alt: z.string().nullable(), width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
  })),
  variants: z.array(z.object({
    sourceId: z.string().min(1), title: z.string().min(1), sku: z.string(),
    barcode: z.string().nullable(),
    price: z.number().nonnegative(), compareAtPrice: z.number().nonnegative().nullable(),
    available: z.boolean(), requiresShipping: z.boolean(), taxable: z.boolean(),
    weightGrams: z.number().nonnegative(),
    image: z.object({ url: z.url(), alt: z.string().nullable() }).nullable(),
    options: z.array(z.string()),
  })).min(1),
});

export type ProductType = z.infer<typeof productTypeSchema>;
export type NormalizedProduct = z.infer<typeof normalizedProductSchema>;
