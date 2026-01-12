import { query } from "@/lib/tryCatch";
import { NextResponse } from "next/server";

const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL
  ? `https://${process.env.PAYLOAD_PUBLIC_SERVER_URL}`
  : "http://localhost:3000";

const nowISO = () => new Date().toISOString();

const buildUrl = (
  loc: string,
  lastmod: string,
  priority: number,
  changefreq = "weekly"
) =>
  `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;

export async function GET() {
  const [result, err] = await query<any>((payload) =>
    payload.find({
      collection: "pages",
      where: {
        _status: { equals: "published" },
        slug: { not_equals: "home" },
      },
      pagination: { limit: 0 },
      select: { slug: true, updatedAt: true },
      sort: "-updatedAt",
    })
  );

  if (err || !result) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  }

  const docs = result.docs as Array<{ slug: string; updatedAt?: string }>;
  const urls: string[] = [];

  // Homepage
  const homeLast = docs.find((d) => d.slug === "home")?.updatedAt
    ? new Date(docs.find((d) => d.slug === "home")!.updatedAt!).toISOString()
    : nowISO();

  urls.push(buildUrl(`${baseUrl}/vi/`, homeLast, 1.0, "daily"));
  urls.push(buildUrl(`${baseUrl}/en/`, homeLast, 1.0, "daily"));

  // Other pages
  for (const doc of docs) {
    if (doc.slug === "home") continue;

    const last = doc.updatedAt
      ? new Date(doc.updatedAt).toISOString()
      : nowISO();

    const slug = encodeURIComponent(doc.slug);

    urls.push(buildUrl(`${baseUrl}/${slug}`, last, 0.8));
    urls.push(buildUrl(`${baseUrl}/en/${slug}`, last, 0.8));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
