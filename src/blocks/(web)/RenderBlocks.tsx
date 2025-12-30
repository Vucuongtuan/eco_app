//@ts-nocheck

import { ContentBlock } from "@/blocks/(web)/Content/Component";
import { MediaBlock } from "@/blocks/(web)/MediaBlock/Component";
import { toKebabCase } from "@/utilities/toKebabCase";
import React, { Fragment } from "react";

import { cn } from "@/lib/utils";
import { Page } from "@/payload-types";
import { Lang } from "@/types";
import { spacing } from "@/utilities/cssVariable";
import { CarouselBlock } from "./Carousel/Components";
import { ColumnMedia } from "./ColumnMedia/Component";
import GalleryComponent from "./Gallery/Component";
import InfoListComponent from "./InfoList/Component";
import ListProductsComp from "./ListProduct/Component";
import ModelComponent from "./Model/Component";
import { RowBlock } from "./Row/Component";
import SpotlightMediaComponent from "./SpotlightMedia/Component";

const blockComponents = {
  content: ContentBlock,
  mediaBlock: MediaBlock,
  columnMedia: ColumnMedia,
  carousel: CarouselBlock,
  rowBlock: RowBlock,
  ListProducts: ListProductsComp,
  SpotlightMedia: SpotlightMediaComponent,
  InfoList: InfoListComponent,
  Model: ModelComponent,
  gallery: GalleryComponent,
};
export const RenderBlocks: React.FC<{
  blocks: Page["sections"];
  lang: Lang;
}> = (props) => {
  const { blocks } = props;
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0;

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks!.map((block, idx) => {
          const { blockName, blockType } = block;

          if (blockType && blockType in blockComponents) {
            const Block =
              blockComponents[blockType as keyof typeof blockComponents];
            if (Block) {
              return (
                <section
                  className={cn(
                    idx !== 0 &&
                      `${spacing(block.spacing || block.configs?.spacing || "none")}`,
                    idx === 0 && ""
                  )}
                  style={
                    block.background && {
                      backgroundColor: `${block.background}`,
                    }
                  }
                  key={idx}
                  aria-label={blockName || blockType}
                >
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore - weird type mismatch here */}
                  <Block
                    id={toKebabCase(blockName!)}
                    {...block}
                    idx={idx}
                    lang={props.lang}
                  />
                </section>
              );
            }
          }
          return null;
        })}
      </Fragment>
    );
  }

  return null;
};
