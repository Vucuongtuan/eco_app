import type { Block, Field } from "payload";

import { defaultLexical } from "@/fields/defaultLexical";
import { layout } from "@/fields/layout";
import { spacingField } from "@/fields/spacingField";
import { afterReadContent } from "@/hooks/afterReadContent";

const columnFields: Field[] = [
  {
    name: "size",
    type: "select",
    defaultValue: "oneThird",
    options: [
      {
        label: "One Third",
        value: "oneThird",
      },
      {
        label: "Half",
        value: "half",
      },
      {
        label: "Two Thirds",
        value: "twoThirds",
      },
      {
        label: "Full",
        value: "full",
      },
    ],
  },
  {
    name: "type",
    type: "select",
    options: [
      { value: "content", label: "Content" },
      { value: "media", label: "Media" },
    ],
    defaultValue: "content",
  },
  {
    name: "media",
    type: "upload",
    relationTo: "media",
    admin: {
      condition: (_, siblingData) => siblingData.type === "media",
    },
  },
  {
    name: "richText",
    type: "richText",
    editor: defaultLexical({
      headingSizes: ["h2", "h3", "h4"],
      enableHeading: true,
      enableTextState: true,
      enableLink: true,
      enableTable: true,
      enableBlock: true,
    }),
    hooks: {
      afterRead: [afterReadContent],
    },
    label: false,
    localized: true,
    admin: {
      condition: (_, siblingData) => siblingData.type === "content",
    },
  },
];

export const Content: Block = {
  slug: "content",
  interfaceName: "ContentBlock",
  fields: [
    layout,
    ...spacingField({
      localized: true,
    }),
    {
      name: "columns",
      type: "array",
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
      maxRows: 3,
    },
  ],
};
