import { layout } from "@/fields/layout";
import { link } from "@/fields/link";
import { aspectField, spacingField } from "@/fields/spacingField";
import { Block } from "payload";

export const ColumnMedia: Block = {
  slug: "columnMedia",
  interfaceName: "ColumnMediaBlock",
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
              name: "items",
              type: "array",
              interfaceName: "ColumnMediaItems",
              fields: [
                {
                  name: "media",
                  type: "upload",
                  relationTo: "media",
                  localized: true,
                },
                link({
                  disableLabel: false,
                  localeLabel: true,
                }),
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
            {
              name: "columns",
              type: "number",
              defaultValue: 2,
              max: 4,
              min: 1,
            },
          ],
        },
      ],
    },
  ],
};
