import { CollectionConfig } from "payload";
import { afterChangeNewsletter } from "./hooks/afterChangeNewsletter";

export const Newsletter: CollectionConfig = {
  slug: "newsletter",
  labels: {
    singular: {
      vi: "Newsletter",
      en: "Newsletter",
    },
    plural: {
      vi: "Newsletter",
      en: "Newsletter",
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    afterChange: [afterChangeNewsletter],
  },

  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "allEmail",
      type: "checkbox",
      label: {
        vi: "Gửi đến tất cả email",
        en: "Send to all email",
      },
    },
    {
      name: "listEmail",
      type: "relationship",
      relationTo: "email-subscribe",
      label: {
        vi: "Email",
        en: "Email",
      },
      hasMany: true,
      admin: {
        condition: (_, { allEmail }) => !allEmail,
      },
    },
    {
      name: "template",
      type: "select",
      options: [
        {
          label: "Blog",
          value: "blog",
        },
        {
          label: "Product",
          value: "product",
        },
      ],
    },
    {
      name: "blogs",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      admin: {
        condition: (_, { template }) => template === "blog",
      },
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      admin: {
        condition: (_, { template }) => template === "product",
      },
    },
  ],
  versions: {
    drafts: {
      schedulePublish: {
        timeIntervals: 30,
      },
    },
  },
};
