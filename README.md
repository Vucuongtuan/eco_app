# Moon Co.

Headless e-commerce platform with real-time customer behavior analytics. Shopify is
the source of truth for commerce; Moon Co. owns the storefront and analytics pipeline.

## Roadmap status

Current scope: **Phase 1 — Shopify setup and API smoke tests**.

Planned boundaries (created only when their phase starts):

```text
apps/storefront/             Next.js storefront
apps/analytics-dashboard/   Next.js analytics dashboard
tools/product-importer/      Authorized source -> normalize -> validate -> Shopify
packages/tracking/           Browser tracking SDK
services/event-collector/    Validated browser events -> Kafka
services/analytics/          Python Kafka consumers -> ClickHouse
infrastructure/              Docker Compose for Kafka and ClickHouse
```

Phase 1 currently contains `tools/shopify-tools`, a server-side Admin GraphQL smoke-test
client. It is not the product crawler/importer.

## Authorized catalog crawl

The importer accepts an authorized Shopify catalog origin and collection handle, capped at
200 products. Confirm that you have permission to reuse catalog content before use.

```bash
npm run crawl:products -- --origin https://catalog.example --collection new-in-men --max-products 200
```

Output is written to ignored local files under `data/product-importer/`. Crawling does not
import anything into Shopify; Shopify import remains a separate explicit step.

Rebuild normalized catalog data from the existing raw crawl after changing taxonomy rules:

```bash
npm run normalize:products
```

This writes the normalized catalog plus classification diagnostics:

```text
data/product-importer/products.ndjson
data/product-importer/classification-errors.ndjson
data/product-importer/unmapped-tags.json
data/product-importer/taxonomy-summary.json
```

Moon Co. owns the normalized taxonomy. Source tags are retained for traceability but are
not copied directly into Shopify. Products are imported as drafts with controlled tags such
as `gender:men`, `product-type:shirt`, and `collection:new-arrivals`. Review classification
diagnostics before importing.

Preview the first 10 Shopify mutations, then import them as drafts:

```bash
npm run import:products -- --limit 10 --dry-run
npm run import:products -- --limit 10
npm run import:products -- --limit 200 --resume
```

After importing, link separately managed color products by their shared `styleGroup`:

```bash
npm run link-product-colors -- --input data/product-importer/products.ndjson \
  --progress data/product-importer/import-progress.json --dry-run
npm run link-product-colors -- --input data/product-importer/products.ndjson \
  --progress data/product-importer/import-progress.json
```

This writes `moon.color` and `moon.color_siblings` (`list.product_reference`) metafields.
Each color keeps its own product URL and size variants; storefront color swatches navigate
between the linked product pages.

## Phase 1 setup

Requirements: Node.js 22.12+, a Shopify Dev Store, and a custom app installed on that
store with the minimum required Admin API scopes.

```bash
npm install
npm run shopify -- version
cp tools/shopify-tools/.env.example tools/shopify-tools/.env
```

Fill the environment file, then verify catalog access:

```bash
npm run shopify:products
```

To test a product mutation, first preview the exact mutation input:

```bash
npm run shopify:create-product -- --dry-run
npm run shopify:create-product -- --title "Moon Co. Test Product"
```

The create command requires `write_products`. The query command only requires
`read_products`. Never use an Admin API token in browser code.

See [docs/architecture.md](docs/architecture.md) for system boundaries and phased rules.
