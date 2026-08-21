import type { HomeContent } from "@/lib/shopify/cms";
import { CardGrid } from "./CardGrid";
import { ContentSection } from "./ContentSection";
import { FeaturedSection } from "./FeaturedSection";
import { listField } from "@/lib/shopify/metaobjects";

export function RenderSections({ home }: { home: HomeContent }) {
  return (
    <>
      {home.featuredSections.map((section) => <FeaturedSection key={section.id} section={section} />)}
      {home.cardGrids.map((grid) => {
        const cardIds = new Set(listField(grid, "cards"));
        const entries = cardIds.size ? home.cards.filter((card) => cardIds.has(card.id) || cardIds.has(card.handle)) : home.cards;
        return <CardGrid key={grid.id} id={grid.id} title={grid.fields.title} entries={entries} />;
      })}
      {home.contentSections.map((section) => <ContentSection key={section.id} entry={section} />)}
    </>
  );
}
