import Link from "next/link";
import { Image } from "@/components/common";
import type { FeaturedSection as FeaturedSectionData } from "@/lib/shopify/cms";

export function FeaturedSection({ section }: { section: FeaturedSectionData }) {
  const { image, links, title } = section;

  return (
    <section className="relative aspect-4/2 min-h-70 w-full overflow-hidden bg-[#f3eee9] sm:min-h-0">
      {image ? <Image src={image.url} alt={image.altText ?? title} fill className="size-full object-cover max-md:object-contain" /> : null}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-linear-to-t from-black/70 via-black/35 to-transparent px-4 pb-4 pt-16 text-white sm:gap-5 sm:px-8 sm:pb-8 sm:pt-20 md:px-12 md:pb-12">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-5xl">{title}</h2>
        {links.length ? (
          <ul className="flex flex-wrap gap-2 sm:gap-3">
            {links.map((link) => (
              <li key={link.id}>
                <Link href={link.fields.link ?? "#"} className="inline-flex max-w-full items-center rounded-full bg-white/95 px-3 py-2 text-[11px] font-medium text-gray-900 backdrop-blur-sm transition-colors hover:bg-black hover:text-white sm:px-5 sm:py-2.5 sm:text-sm">
                  <span className="truncate">{link.fields.title ?? link.handle}</span>
                  <span aria-hidden="true" className="ml-2 text-base leading-none">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
