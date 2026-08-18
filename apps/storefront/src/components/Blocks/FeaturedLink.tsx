import Link from "next/link";
import type { CmsMetaobject } from "@/lib/shopify/metaobjects";

export function FeaturedLink({ entry }: { entry: CmsMetaobject }) {
  return <Link href={entry.fields.url ?? "#"} className="text-sm text-gray-700 transition-colors hover:text-black">{entry.fields.title ?? ""}</Link>;
}
