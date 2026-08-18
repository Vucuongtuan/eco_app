import type { HomeContent } from "@/lib/shopify/cms";
import { CardGrid } from "./CardGrid";
import { ContentSection } from "./ContentSection";
import { FeaturedSection } from "./FeaturedSection";

export function RenderSections({ home }: { home: HomeContent }) {
  return (
    <>
      {home.featuredSections.map((section) => <FeaturedSection key={section.id} section={section} />)}
      {home.cardGrids.map((grid) => <CardGrid key={grid.id} entries={home.cards} />)}
      {home.contentSections.map((section) => <ContentSection key={section.id} entry={section} />)}
    </>
  );
}
