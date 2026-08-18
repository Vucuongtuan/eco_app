import { Image } from "@/components/common";
import Link from "next/link";
import type { CmsMetaobject } from "@/lib/shopify/metaobjects";

export function ContentSection({ entry }: { entry: CmsMetaobject }) {
  const title = entry.fields.title ?? "";
  const link = entry.fields.link;
  return <section className="relative overflow-hidden bg-gray-900 px-8 py-16 text-white">
    {entry.references.background_image ? <Image src={entry.references.background_image.url} alt="" fill sizes="100vw" className="object-cover opacity-60" /> : null}
    <div className="relative max-w-xl">
      <h2 className="text-3xl font-light">{title}</h2>
      {entry.fields.description ? <p className="mt-4 text-sm leading-6 text-white/80">{entry.fields.description}</p> : null}
      {link && entry.fields.link_label ? <Link href={link} className="mt-6 inline-block text-sm underline underline-offset-4">{entry.fields.link_label}</Link> : null}
    </div>
  </section>;
}
