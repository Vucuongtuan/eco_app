import { Block } from "payload";

export const FeatureMedia: Block = {
  slug: "mobile-feature-media",
  interfaceName: "MobileFeatureMediaProps",
  fields: [
    {
      type: "upload",
      name: "image",
      relationTo: "media",
    },
    {
      name: "enableText",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "title",
      type: "text",
      admin: {
        condition: (_, { enableText }) => enableText === true,
      },
    },
    {
      name: "link",
      type: "text",
    },
  ],
};
