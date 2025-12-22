import { SearchResultDoc, SearchTagResultDoc } from "@/types";

const ensureHtml = (u: string): string => {
  if (!u) return "#URLParseFailed";
  const url = u.endsWith("/") ? u.slice(0, -1) : u;
  return url.endsWith(".html") ? url : `${url}.html`;
};

export const parseSearchResultURL = (
  doc: SearchResultDoc | SearchTagResultDoc
): string => {
  if ("slug" in doc && typeof doc.slug === "string" && !("url" in doc)) {
    return `${doc.slug}.html`;
  }

  if ("url" in doc) {
    const base = doc.url ?? "";
    if (doc.doc?.relationTo === "posts") return ensureHtml(base);
    return base || "#URLParseFailed";
  }

  return "#URLParseFailed";
};
export const parseSearchQuery = (
  q: string
): { keyword: string; tagId: string | undefined } => {
  if (!q) return { keyword: "", tagId: undefined };

  const decodedQ = decodeURIComponent(q);
  const hashTagMatch = decodedQ.match(/^hash-(.+)-([a-z0-9]+)$/i);

  if (hashTagMatch && q.startsWith("hash-")) {
    return {
      keyword: hashTagMatch[1],
      tagId: hashTagMatch[2],
    };
  }
  return {
    keyword: q,
    tagId: undefined,
  };
};
