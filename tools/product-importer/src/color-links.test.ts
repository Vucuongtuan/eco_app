import assert from "node:assert/strict";
import test from "node:test";
import { buildColorLinks, colorLinkMetafields } from "./color-links.ts";
import type { NormalizedProduct } from "./schema.ts";

function product(sourceId: string, title: string, styleGroup: string, color: string): NormalizedProduct {
  return {
    source: { productId: sourceId, originalTags: [], publishedAt: null, updatedAt: null },
    identity: { handle: sourceId, title, styleGroup },
    classification: { gender: "men", department: "tops", productType: "shirt", categoryPath: ["men", "tops", "shirt"], shopifyTaxonomyId: null },
    merchandising: { collections: [], tags: [], status: "DRAFT" },
    attributes: { color, materials: [], fit: null, styles: [] },
    descriptionHtml: "", commerce: { currency: "SGD", basePrice: 10 }, images: [],
    variants: [{ sourceId: `${sourceId}-s`, title: "S", sku: "", barcode: null, price: 10, compareAtPrice: null, available: true, requiresShipping: true, taxable: true, weightGrams: 0, image: null, options: ["S"] }],
  };
}

test("links each color product to the other products in its style group", () => {
  const products = [product("orange", "Shirt - Orange", "shirt", "orange"), product("cocoa", "Shirt - Cocoa", "shirt", "cocoa")];
  const links = buildColorLinks(products, {
    orange: { shopifyId: "gid://shopify/Product/1", importedAt: "now" },
    cocoa: { shopifyId: "gid://shopify/Product/2", importedAt: "now" },
  });
  assert.deepEqual(links.map((link) => link.siblingIds), [["gid://shopify/Product/2"], ["gid://shopify/Product/1"]]);
  assert.equal(colorLinkMetafields(links[0])[1].type, "list.product_reference");
});
