import { CollectionSlug, PayloadRequest } from "payload";

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  pages: "/pages",
  posts: "/posts",
};

type Props = {
  collection: keyof typeof collectionPrefixMap;
  slug: string;
  req: PayloadRequest;
  locale: string;
};

export const generatePreviewPath = ({ collection, slug, locale }: Props) => {
  const isHomePage = collection === "pages" && slug === "home";
  const path = isHomePage ? "/" : `${collectionPrefixMap[collection]}/${slug}`;
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || "",
    locale,
  });

  const url = `/preview?${encodedParams}`;

  return url;
};
