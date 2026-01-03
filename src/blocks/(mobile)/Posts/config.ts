import { Block } from "payload";

export const MobilePosts: Block = {
  slug: "mobile-posts",
  interfaceName: "MobilePostsProps",
  fields: [
    {
      name: "title",
      type: "text",
      label: "Title VN",
    },
    {
      name: "title_en",
      type: "text",
      label: "Title EN",
    },
    {
      name: "description",
      type: "text",
      label: "Description VN",
    },
    {
      name: "description_en",
      type: "text",
      label: "Description EN",
    },
    {
      name: "type",
      type: "select",
      label: "Type",
      options: [
        {
          label: "New Arrivals",
          value: "new_arrivals",
        },
        {
          label: "Posts archives",
          value: "posts_archives",
        },
      ],
    },
    {
      name: "posts",
      type: "relationship",
      relationTo: "posts",
      admin: {
        condition: (_, { type } = {}) => type === "posts_archives",
      },
    },
  ],
};
