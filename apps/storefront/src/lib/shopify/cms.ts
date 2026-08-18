import "server-only";
import { getMetaobjects, getMetaobjectsByIds, listField, type CmsMetaobject } from "./metaobjects";
import type { Image } from "./types";

export type FeaturedSection = {
  id: string;
  handle: string;
  title: string;
  image: Image | null;
  links: CmsMetaobject[];
};

export async function getFeaturedSections(): Promise<FeaturedSection[]> {
  const entries = await getMetaobjects("featured_section");
  return Promise.all(entries.map(async (entry) => ({
    id: entry.id,
    handle: entry.handle,
    title: entry.fields.title ?? "",
    image: entry.references.image,
    links: await getMetaobjectsByIds(listField(entry, "links")),
  })));
}

export type HomeContent = {
  featuredLinks: Awaited<ReturnType<typeof getMetaobjects>>;
  featuredSections: FeaturedSection[];
  cards: Awaited<ReturnType<typeof getMetaobjects>>;
  cardGrids: Awaited<ReturnType<typeof getMetaobjects>>;
  contentSections: Awaited<ReturnType<typeof getMetaobjects>>;
};
