import { Block } from "payload";

export const RichText: Block = {
  slug: "mobile-richtext",
  interfaceName: "MobileRichTextProps",
  fields: [
    {
      name: "content",
      type: "richText",
    },
    {
      name: "content_en",
      type: "richText",
    },
  ],
};
