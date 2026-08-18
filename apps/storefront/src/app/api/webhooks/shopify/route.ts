import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

function isValidSignature(body: string, signature: string | null) {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(body, "utf8").digest("base64");
  const received = Buffer.from(signature, "base64");
  const digest = Buffer.from(expected, "base64");
  return received.length === digest.length && timingSafeEqual(received, digest);
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!isValidSignature(body, request.headers.get("x-shopify-hmac-sha256"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  if (topic.startsWith("menus/")) {
    revalidateTag("shopify-menus", "max");
  }
  if (topic.startsWith("metaobjects/")) {
    revalidateTag("shopify-cms", "max");
    revalidateTag("shopify-cms:home", "max");
  }

  return Response.json({
    revalidated: topic.startsWith("menus/") || topic.startsWith("metaobjects/"),
    topic,
  });
}
