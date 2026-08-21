import type { Metadata } from "next";

type GenerateMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: { url: string; width?: number | null; height?: number | null; altText?: string | null } | null;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export function generateMetadata({ title, description, path, image }: GenerateMetadataOptions = {}): Metadata {
  const url = path ? new URL(path, siteUrl).toString() : siteUrl;
  const imageUrl = image?.url ? new URL(image.url, siteUrl).toString() : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      ...(imageUrl ? { images: [{ url: imageUrl, width: image?.width ?? undefined, height: image?.height ?? undefined, alt: image?.altText ?? title }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
