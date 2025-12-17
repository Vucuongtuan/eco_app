import { layout } from "@/fields/layout";
import { link } from "@/fields/link";
import { aspectField, spacingField } from "@/fields/spacingField";
import { Block } from "payload";

export const Carousel: Block = {
  slug: "carousel",
  interfaceName: "Carousel",
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: {
            en: "General",
            vi: "Chung",
          },
          fields: [
            {
              name: "duration",
              type: "number",
              defaultValue: 10000,
              required: true,
            },
            {
              type: "array",
              name: "gallery",
              interfaceName: "CarouselGallery",
              fields: [
                {
                  name: "media",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  localized: true,
                },
                {
                  name: "heading",
                  type: "text",
                  localized: true,
                },
                {
                  name: "content",
                  type: "richText",
                  localized: true,
                },
                link({ disableLabel: true }),
              ],
            },
          ],
        },
        {
          label: {
            en: "Config",
            vi: "Cấu hình",
          },
          fields: [
            layout,
            ...spacingField({
              localized: false,
            }),
            ...aspectField({
              localized: false,
            }),
          ],
        },
      ],
    },
  ],
};
