import { Image } from "@/components/common";
import type { CmsMetaobject } from "@/lib/shopify/metaobjects";

export function Card({ entry }: { entry: CmsMetaobject }) {
  const title = entry.fields.title ?? "";
  return <article>
    <div className="relative aspect-[4/5] overflow-hidden bg-[#f3eee9]">
      {entry.references.image ? <Image src={entry.references.image.url} alt={entry.references.image.altText ?? title} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" /> : null}
    </div>
    <h3 className="mt-3 text-sm font-medium">{title}</h3>
  </article>;
}
