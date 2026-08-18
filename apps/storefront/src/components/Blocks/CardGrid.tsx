import type { CmsMetaobject } from "@/lib/shopify/metaobjects";
import { Card } from "./Card";

export function CardGrid({ entries }: { entries: CmsMetaobject[] }) {
  return <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{entries.map((entry) => <Card key={entry.id} entry={entry} />)}</section>;
}
