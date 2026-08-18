import { CheerioCrawler, log } from "crawlee";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeProductWithDiagnostics, type SourceProduct } from "./normalize.ts";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function option(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : (process.argv[index + 1] ?? "");
}

const maxProducts = Number(option("--max-products", "200"));
const origin = option("--origin", "");
const collection = option("--collection", "new-in-men");
const output = resolve(REPOSITORY_ROOT, option("--output", "data/product-importer/products.ndjson"));
const rawOutput = resolve(REPOSITORY_ROOT, option("--raw-output", "data/product-importer/raw.ndjson"));
const errorOutput = resolve(REPOSITORY_ROOT, option("--error-output", "data/product-importer/errors.ndjson"));
const checkpointFile = resolve(REPOSITORY_ROOT, option("--checkpoint", "data/product-importer/checkpoint.json"));
const classificationErrorOutput = resolve(REPOSITORY_ROOT, option("--classification-errors", "data/product-importer/classification-errors.ndjson"));
const fresh = process.argv.includes("--fresh");

if (!Number.isInteger(maxProducts) || maxProducts < 1 || maxProducts > 200) {
  throw new Error("--max-products must be an integer from 1 to 200");
}
if (!origin) throw new Error("--origin is required");
const parsedOrigin = new URL(origin);
if (!/^https?:$/.test(parsedOrigin.protocol)) throw new Error("--origin must be an HTTP(S) URL");
const normalizedOrigin = parsedOrigin.origin;
if (!/^[a-z0-9-]+$/.test(collection)) throw new Error("--collection must be a Shopify collection handle");

type Checkpoint = { completed: boolean; sourceIds: string[] };
async function loadCheckpoint(): Promise<Checkpoint> {
  if (fresh) return { completed: false, sourceIds: [] };
  try {
    return JSON.parse(await readFile(checkpointFile, "utf8")) as Checkpoint;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { completed: false, sourceIds: [] };
    }
    throw error;
  }
}

for (const file of [output, rawOutput, errorOutput, checkpointFile, classificationErrorOutput]) {
  await mkdir(dirname(file), { recursive: true });
}
if (fresh) {
  await Promise.all([writeFile(output, ""), writeFile(rawOutput, ""), writeFile(errorOutput, ""), writeFile(classificationErrorOutput, "")]);
}

const checkpoint = await loadCheckpoint();
const seen = new Set(checkpoint.sourceIds);
if (checkpoint.completed && seen.size >= maxProducts) {
  log.info(`Already completed with ${seen.size} products. Use --fresh to crawl again.`);
  process.exit(0);
}

const startUrl = `${normalizedOrigin}/collections/${collection}/products.json?limit=${maxProducts}&page=1`;
const crawler = new CheerioCrawler({
  maxConcurrency: 1,
  maxRequestRetries: 3,
  requestHandlerTimeoutSecs: 30,
  async requestHandler({ body }) {
    const payload = JSON.parse(body.toString()) as { products?: SourceProduct[] };
    if (!Array.isArray(payload.products)) throw new Error("Source response has no products array");

    for (const product of payload.products) {
      if (seen.size >= maxProducts) break;
      const sourceId = String(product.id);
      if (seen.has(sourceId)) continue;
      await appendFile(rawOutput, `${JSON.stringify(product)}\n`);
      try {
        const { product: normalized, diagnostics } = normalizeProductWithDiagnostics(product);
        await appendFile(output, `${JSON.stringify(normalized)}\n`);
        if (diagnostics.warnings.length || diagnostics.unmappedTags.length) {
          await appendFile(classificationErrorOutput, `${JSON.stringify({
            sourceId, title: product.title, ...diagnostics,
          })}\n`);
        }
        seen.add(sourceId);
        await writeFile(checkpointFile, JSON.stringify({ completed: false, sourceIds: [...seen] }, null, 2));
      } catch (error) {
        await appendFile(errorOutput, `${JSON.stringify({ sourceId, error: String(error) })}\n`);
      }
    }
  },
  async failedRequestHandler({ request }, error) {
    await appendFile(errorOutput, `${JSON.stringify({ url: request.url, error: error.message })}\n`);
  },
});

await crawler.run([startUrl]);
await writeFile(checkpointFile, JSON.stringify({ completed: true, sourceIds: [...seen] }, null, 2));
log.info(`Crawl complete: ${seen.size}/${maxProducts} valid products`, { output });
