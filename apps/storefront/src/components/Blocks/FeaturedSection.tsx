import Link from "next/link";
import { Image } from "@/components/common";
import type { FeaturedSection as FeaturedSectionData } from "@/lib/shopify/cms";

export function FeaturedSection({ section }: { section: FeaturedSectionData }) {
  const { image, links, title } = section;

  return (
    <section className="relative aspect-[4/2] w-full overflow-hidden bg-[#f3eee9]">
      {image ? <Image src={image.url} alt={image.altText ?? title} fill className="size-full object-cover" /> : null}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-8 pb-8 pt-20 text-white md:px-12 md:pb-12">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
        {links.length ? (
          <ul className="flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.id}>
                <Link href={link.fields.link ?? "#"} className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-black hover:text-white">
                  {link.fields.title ?? link.handle}
                  <span aria-hidden="true" className="ml-2 text-base">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
