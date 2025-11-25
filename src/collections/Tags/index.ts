import { CollectionConfig } from "payload";

export const Tags: CollectionConfig = {
  slug: "tags",
  labels: {
    singular: {
      en: "HashTag",
      vi: "Hashtag",
    },
    plural: {
      en: "HashTag",
      vi: "Hashtag",
    },
  },
  admin: {
    useAsTitle: "title",
  },
  defaultPopulate: {
    title: true,
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  // defaultSort: "slug",
  // defaultPopulate: ["title", "description", "slug"],
  // defaultPopulate: ["title", "description", "slug"],
  hooks: {
    // beforeChange: [generateSlugForTitle],
  },
  fields: [
    {
      name: "title",
      type: "text",
    },
    {
      name: "title_en",
      type: "text",
    },
    // ...slugField("title", {}, true),
    // {
    //   name: "breadcrumbs",
    //   type: "ui",
    //   admin: {
    //     components: {
    //       Field:
    //         "@/app/(payload)/customFields/breadcrumbs/breadcrumbsUI#BreadcrumbsUI"
    //     }
    //   }
    // }
    // { ...CustomSlugField }
  ],
};
