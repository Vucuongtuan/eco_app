import { NextResponse } from "next/server";

const baseUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.PAYLOAD_PUBLIC_SERVER_URL
    ? `https://${process.env.PAYLOAD_PUBLIC_SERVER_URL}`
    : "http://localhost:3000");

export function GET() {
  const now = new Date().toISOString();
  const sitemaps = [
    "sitemap-pages.xml",
    "sitemap-products.xml",
    "sitemap-categories.xml",
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemaps
      .map(
        (s) =>
          `<sitemap><loc>${baseUrl}/${s}</loc><lastmod>${now}</lastmod></sitemap>`
      )
      .join("\n")}
  </sitemapindex>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
