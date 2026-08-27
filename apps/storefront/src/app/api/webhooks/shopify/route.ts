import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

function isValidSignature(body: string, signature: string | null) {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(body, "utf8").digest("base64");
  const received = Buffer.from(signature, "base64");
  const digest = Buffer.from(expected, "base64");
  return received.length === digest.length && timingSafeEqual(received, digest);
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  if (!isValidSignature(bodyText, request.headers.get("x-shopify-hmac-sha256"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(bodyText);
  } catch {
    // raw body parse fallback
  }

  let revalidated = false;

  // 1. PRODUCTS (create, update, delete)
  if (topic.startsWith("products/")) {
    revalidateTag("shopify-products", "max");
    if (typeof payload.handle === "string") {
      revalidateTag(`shopify-product:${payload.handle}`, "max");
    }
    revalidated = true;
  }

  // 2. COLLECTIONS (create, update, delete)
  if (topic.startsWith("collections/")) {
    revalidateTag("shopify-collections", "max");
    if (typeof payload.handle === "string") {
      revalidateTag(`shopify-collection:${payload.handle}`, "max");
    }
    revalidated = true;
  }

  // 3. MENUS (navigation changes)
  if (topic.startsWith("menus/")) {
    revalidateTag("shopify-menus", "max");
    if (typeof payload.handle === "string") {
      revalidateTag(`shopify-menu:${payload.handle}`, "max");
    }
    revalidated = true;
  }

  // 4. PAGES (static pages)
  if (topic.startsWith("pages/")) {
    revalidateTag("shopify-pages", "max");
    if (typeof payload.handle === "string") {
      revalidateTag(`shopify-page:${payload.handle}`, "max");
    }
    revalidated = true;
  }

  // 5. BLOGS & ARTICLES (blog posts)
  if (topic.startsWith("blogs/") || topic.startsWith("articles/")) {
    revalidateTag("shopify-blogs", "max");
    if (typeof payload.handle === "string") {
      revalidateTag(`shopify-article:${payload.handle}`, "max");
    }
    revalidated = true;
  }

  // 6. METAOBJECTS (CMS custom sections)
  if (topic.startsWith("metaobjects/")) {
    revalidateTag("shopify-cms", "max");
    revalidateTag("shopify-cms:home", "max");
    revalidated = true;
  }

  // 7. DYNAMIC FALLBACK (Catch-all for any other unhandled topics)
  if (!revalidated && topic) {
    revalidateTag("shopify-cms", "max");
    revalidated = true;
  }

  return Response.json({ revalidated, topic });
}
