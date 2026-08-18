# Moon Co. architecture

## Source-of-truth boundaries

- Shopify owns products, variants, collections, media, inventory, customers, carts,
  checkout, and orders.
- ClickHouse owns behavioral and derived analytics data, never transactional commerce.
- No database duplicates the full Shopify catalog without a concrete use case.
- Browser events go through a validated collector API; browsers never connect to Kafka.
- Shopify webhooks are verified and represented separately from browser events.

## Delivery phases

1. Shopify Dev Store, CLI, API access, product query/mutation, and 10-product smoke test.
2. Authorized catalog fetcher, normalization schema, validation, deduplication, retry,
   progress, resume, dry-run, and import of at most 200 products for the initial source.
3. Next.js storefront: home, catalog, collection, PDP, search, cart, checkout, success.
4. Versioned tracking SDK and validated event collector.
5. Kafka topics and idempotent producers/consumers.
6. Python processing and ClickHouse analytics models.
7. Next.js real-time analytics dashboard.
8. Journey-based traffic simulator and measured benchmarks.

Kafka is reserved for behavioral and commerce event streams; it is not part of the
200-product import path. Redis or other infrastructure is added only for a demonstrated
use case.

## Catalog import boundary

```text
Authorized external source
  -> crawler/fetcher
  -> raw product
  -> normalizer
  -> validator
  -> deduplicator
  -> resumable Shopify importer
  -> Shopify Admin GraphQL API
```

The tool must not bypass CAPTCHA, authentication, anti-bot, or access controls.
