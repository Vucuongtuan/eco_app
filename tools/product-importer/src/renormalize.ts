import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeProductWithDiagnostics, type SourceProduct } from "./normalize.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = process.argv.slice(2);
function option(name: string, fallback: string): string {
  const index = args.indexOf(name);
  return index === -1 ? fallback : (args[index + 1] ?? "");
}

const rawFile = resolve(ROOT, option("--raw", "data/product-importer/raw.ndjson"));
const outputFile = resolve(ROOT, option("--output", "data/product-importer/products.ndjson"));
const diagnosticsFile = resolve(ROOT, option("--classification-errors", "data/product-importer/classification-errors.ndjson"));
const unmappedFile = resolve(ROOT, option("--unmapped-tags", "data/product-importer/unmapped-tags.json"));
const summaryFile = resolve(ROOT, option("--summary", "data/product-importer/taxonomy-summary.json"));

const sourceProducts = (await readFile(rawFile, "utf8")).split(/\r?\n/).filter(Boolean)
  .map((line, index) => {
    try { return JSON.parse(line) as SourceProduct; }
    catch (error) { throw new Error(`Invalid raw product at line ${index + 1}: ${String(error)}`); }
  });

const normalized = sourceProducts.map((source) => ({ source, ...normalizeProductWithDiagnostics(source) }));
const diagnostics = normalized.filter(({ diagnostics }) => diagnostics.warnings.length || diagnostics.unmappedTags.length)
  .map(({ source, diagnostics }) => ({ sourceId: String(source.id), title: source.title, ...diagnostics }));
const unmappedCounts = new Map<string, number>();
for (const item of diagnostics) {
  for (const tag of item.unmappedTags) unmappedCounts.set(tag, (unmappedCounts.get(tag) ?? 0) + 1);
}
const productTypes: Record<string, number> = {};
const collections: Record<string, number> = {};
let warningProducts = 0;
for (const item of normalized) {
  const type = item.product.classification.productType;
  productTypes[type] = (productTypes[type] ?? 0) + 1;
  for (const collection of item.product.merchandising.collections) {
    collections[collection] = (collections[collection] ?? 0) + 1;
  }
  if (item.diagnostics.warnings.length) warningProducts += 1;
}

for (const file of [outputFile, diagnosticsFile, unmappedFile, summaryFile]) await mkdir(dirname(file), { recursive: true });
await Promise.all([
  writeFile(outputFile, normalized.map(({ product }) => JSON.stringify(product)).join("\n") + "\n"),
  writeFile(diagnosticsFile, diagnostics.map((item) => JSON.stringify(item)).join("\n") + (diagnostics.length ? "\n" : "")),
  writeFile(unmappedFile, JSON.stringify(Object.fromEntries([...unmappedCounts].sort((a, b) => b[1] - a[1])), null, 2) + "\n"),
  writeFile(summaryFile, JSON.stringify({
    totalProducts: normalized.length,
    classifiedProducts: normalized.filter(({ product }) => product.classification.productType !== "unknown").length,
    warningProducts,
    productTypes,
    collections,
  }, null, 2) + "\n"),
]);

console.error(`Normalized ${normalized.length} products; ${warningProducts} have classification warnings; ${unmappedCounts.size} unmapped tags`);
