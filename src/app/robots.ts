/* eslint-disable no-restricted-exports */
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "https://moon-co.vercel.app";

export default function robots() {
  return {
    host: baseUrl,
    rules: [
      {
        userAgent: "*",
      },
    ],
    disallow: ["/admin", "/api"],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
