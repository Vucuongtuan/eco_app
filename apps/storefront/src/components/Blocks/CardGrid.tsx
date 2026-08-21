import type { CmsMetaobject } from "@/lib/shopify/metaobjects";
import { Card } from "./Card";

export function CardGrid({ id, title, entries }: { id: string; title?: string; entries: CmsMetaobject[] }) {
  const headingId = `card-grid-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  
  return <section   aria-labelledby={title ? headingId : undefined} className="">
    {title ? <h2 id={headingId} className="sr-only">{title}</h2> : null}
    <ul className="grid gap-0.5 sm:grid-cols-2">
      {entries.map((entry) => <li key={entry.id} className="aspect-square"><Card entry={entry} /></li>)}
    </ul>
  </section>;
}
