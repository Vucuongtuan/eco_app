import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizedProductSchema, type NormalizedProduct } from "./schema.ts";
import { adminGraphql } from "./shopify.ts";
import { productTypeLabel } from "./taxonomy.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = process.argv.slice(2);
function option(name: string, fallback: string): string {
  const index = args.indexOf(name);
  return index === -1 ? fallback : (args[index + 1] ?? "");
}
const limit = Number(option("--limit", "10"));
const inputFile = resolve(ROOT, option("--input", "data/product-importer/products.ndjson"));
const progressFile = resolve(ROOT, option("--progress", "data/product-importer/import-progress.json"));
const errorFile = resolve(ROOT, option("--errors", "data/product-importer/import-errors.ndjson"));
const dryRun = args.includes("--dry-run");
const resume = args.includes("--resume");
if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw new Error("--limit must be 1..200");

type Progress = { imported: Record<string, { shopifyId: string; importedAt: string }> };
async function loadProgress(): Promise<Progress> {
  if (!resume) return { imported: {} };
  try { return JSON.parse(await readFile(progressFile, "utf8")) as Progress; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { imported: {} };
    throw error;
  }
}

function productInput(product: NormalizedProduct) {
  const maxOptions = Math.max(...product.variants.map((variant) => variant.options.length));
  const optionNames = Array.from({ length: maxOptions }, (_, index) => index === 0 ? "Size" : `Option ${index + 1}`);
  const handle = `moon-${product.source.productId}-${product.identity.handle}`.slice(0, 255);
  const input: Record<string, unknown> = {
    title: product.identity.title,
    handle,
    descriptionHtml: product.descriptionHtml,
    productType: productTypeLabel(product.classification.productType),
    status: product.merchandising.status,
    tags: product.merchandising.tags,
    metafields: [
      { namespace: "moon", key: "source_id", type: "single_line_text_field", value: product.source.productId },
      { namespace: "moon", key: "category_path", type: "list.single_line_text_field", value: JSON.stringify(product.classification.categoryPath) },
      { namespace: "moon", key: "style_group", type: "single_line_text_field", value: product.identity.styleGroup },
    ],
    files: product.images.map((image) => ({ originalSource: image.url, alt: image.alt ?? product.identity.title, contentType: "IMAGE" })),
    productOptions: optionNames.map((name, index) => ({
      name,
      position: index + 1,
      values: [...new Set(product.variants.map((variant) => variant.options[index]).filter(Boolean))]
        .map((name) => ({ name })),
    })),
    variants: product.variants.map((variant) => ({
      optionValues: variant.options.map((name, index) => ({ optionName: optionNames[index], name })),
      sku: variant.sku || undefined,
      barcode: variant.barcode,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      taxable: variant.taxable,
      inventoryItem: { tracked: false, requiresShipping: variant.requiresShipping },
    })),
  };
  if (product.classification.shopifyTaxonomyId) {
    input.category = product.classification.shopifyTaxonomyId;
  }
  return input;
}

const mutation = `
  mutation ImportMoonProduct($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
    productSet(synchronous: true, input: $input, identifier: $identifier) {
      product { id title handle status variants(first: 100) { nodes { id title sku price } } }
      userErrors { code field message }
    }
  }
`;
type Result = { productSet: { product: { id: string; title: string } | null; userErrors: Array<{ field: string[]; message: string }> } };

const lines = (await readFile(inputFile, "utf8")).split(/\r?\n/).filter(Boolean).slice(0, limit);
const products = lines.map((line, index) => {
  try { return normalizedProductSchema.parse(JSON.parse(line)); }
  catch (error) { throw new Error(`Invalid normalized product at line ${index + 1}: ${String(error)}`); }
});
if (dryRun) {
  console.log(JSON.stringify(products.map((product) => ({ sourceId: product.source.productId, input: productInput(product) })), null, 2));
  process.exit(0);
}

await mkdir(dirname(progressFile), { recursive: true });
const progress = await loadProgress();
let completed = 0;
for (const product of products) {
  if (progress.imported[product.source.productId]) continue;
  const input = productInput(product);
  try {
    const data = await adminGraphql<Result>(mutation, { input, identifier: { handle: input.handle } });
    if (data.productSet.userErrors.length || !data.productSet.product) {
      throw new Error(JSON.stringify(data.productSet.userErrors));
    }
    progress.imported[product.source.productId] = {
      shopifyId: data.productSet.product.id,
      importedAt: new Date().toISOString(),
    };
    await writeFile(progressFile, JSON.stringify(progress, null, 2));
    completed += 1;
    console.error(`Imported ${completed}/${products.length}: ${product.identity.title}`);
  } catch (error) {
    await appendFile(errorFile, `${JSON.stringify({ sourceId: product.source.productId, title: product.identity.title, error: String(error) })}\n`);
    console.error(`Failed: ${product.identity.title}`);
  }
}
console.error(`Import finished: ${completed} new products; ${Object.keys(progress.imported).length} tracked total`);
