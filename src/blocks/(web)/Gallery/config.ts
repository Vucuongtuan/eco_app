import { link } from "@/fields/link";
import { Block } from "payload";

export const GalleryBlock: Block = {
  slug: "gallery",
  interfaceName: "GalleryBlockProps",
  fields: [
    {
      type: "array",
      name: "gallery",
      fields: [
        link({
          localeLabel: true,
        }),
        {
          type: "upload",
          name: "image",
          relationTo: "media",
        },
      ],
      maxRows: 4,
    },
  ],
};
