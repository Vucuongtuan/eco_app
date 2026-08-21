import { Image } from "@/components/common";
import type { CmsMetaobject } from "@/lib/shopify/metaobjects";
import Link from "next/link";

export function Card({ entry }: { entry: CmsMetaobject }) {
  const title = entry.fields.title ?? "";
  const href = entry.fields.link ?? entry.fields.url ?? `/collections/${entry.handle}`;
  return <article className="relative aspect-square size-full overflow-hidden bg-[#f3eee9]">
      {entry.references.image ? <Image src={entry.references.image.url} alt={entry.references.image.altText ?? title} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" /> : null}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <h3 className="absolute inset-x-0 bottom-0 px-5 pb-5 text-xl font-medium text-white drop-shadow-sm">{title}</h3>
      <Link href={href} aria-label={title || "View card"} className="absolute inset-0 z-10" />
  </article>;
}
