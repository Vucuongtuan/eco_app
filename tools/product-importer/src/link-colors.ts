import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { adminGraphql } from "./shopify.ts";
import { buildColorLinks, colorLinkMetafields, type ImportedProductIds } from "./color-links.ts";
import { normalizedProductSchema } from "./schema.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = process.argv.slice(2);
function option(name: string, fallback: string): string {
  const index = args.indexOf(name);
  return index === -1 ? fallback : (args[index + 1] ?? "");
}

const inputFile = resolve(ROOT, option("--input", "data/product-importer/products.ndjson"));
const progressFile = resolve(ROOT, option("--progress", "data/product-importer/import-progress.json"));
const dryRun = args.includes("--dry-run");

const products = (await readFile(inputFile, "utf8")).split(/\r?\n/).filter(Boolean)
  .map((line, index) => {
    try { return normalizedProductSchema.parse(JSON.parse(line)); }
    catch (error) { throw new Error(`Invalid normalized product at line ${index + 1}: ${String(error)}`); }
  });
const progress = JSON.parse(await readFile(progressFile, "utf8")) as { imported: ImportedProductIds };
const links = buildColorLinks(products, progress.imported);
const missing = products.filter((product) => !progress.imported[product.source.productId]);
if (missing.length) throw new Error(`${missing.length} products are missing from import progress; import them before linking colors`);

const metafields = links.flatMap(colorLinkMetafields);
const summary = links.map(({ shopifyId: _shopifyId, ...link }) => link);
if (dryRun) {
  console.log(JSON.stringify({ products: links.length, metafields: metafields.length, links: summary }, null, 2));
  process.exit(0);
}

const mutation = `
  mutation LinkColorProducts($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id namespace key type }
      userErrors { field message code }
    }
  }
`;
type Result = {
  metafieldsSet: {
    metafields: Array<{ id: string }> | null;
    userErrors: Array<{ field: string[]; message: string; code: string }>;
  };
};

let written = 0;
for (let index = 0; index < metafields.length; index += 25) {
  const batch = metafields.slice(index, index + 25);
  const data = await adminGraphql<Result>(mutation, { metafields: batch });
  if (data.metafieldsSet.userErrors.length) throw new Error(JSON.stringify(data.metafieldsSet.userErrors));
  written += data.metafieldsSet.metafields?.length ?? 0;
}
console.error(`Linked ${links.length} color products with ${written} metafields`);
