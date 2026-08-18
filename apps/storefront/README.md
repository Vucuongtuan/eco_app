# Storefront

Customer-facing Next.js storefront using TypeScript, Tailwind CSS, and Shopify's
Storefront API. It will be scaffolded in Phase 3.

Admin API credentials must never be exposed to this application's browser bundle.

## Shopify data layer

The server-only Shopify layer lives in `src/lib/shopify`. Copy `.env.example` to
`.env.local` and use a Storefront API token from Shopify's Headless sales channel.
Do not prefix the token with `NEXT_PUBLIC_`.

```ts
import { getProduct, getProducts } from "@/lib/shopify";

const catalog = await getProducts({ first: 24, sortKey: "CREATED_AT", reverse: true });
const product = await getProduct("product-handle");
```

Catalog requests use Next.js cache tags. Cart functions are always uncached and accept a
cart ID explicitly, leaving cookie/session ownership to the application layer.
