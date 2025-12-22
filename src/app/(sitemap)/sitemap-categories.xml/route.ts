import { query } from "@/lib/tryCatch";
import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export async function GET() {
  const [result, err] = await query<any>((payload) =>
    payload.find({
      collection: "categories",
      pagination: { limit: 0 },
      select: { slug: true, updatedAt: true },
      sort: "-updatedAt",
    })
  );

  if (err || !result) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  }

  const docs = result.docs as Array<{ slug: string; updatedAt?: string }>;
  const urls = docs.flatMap((doc) => {
    const last = doc.updatedAt
      ? new Date(doc.updatedAt).toISOString()
      : new Date().toISOString();
    return [
      `  <url><loc>${baseUrl}/collections/${encodeURIComponent(doc.slug)}</loc><lastmod>${last}</lastmod></url>`,
      `  <url><loc>${baseUrl}/en/collections/${encodeURIComponent(doc.slug)}</loc><lastmod>${last}</lastmod></url>`,
    ];
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${urls.join("\n")}\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
