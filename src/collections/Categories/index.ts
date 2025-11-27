import { baseField } from "@/fields/baseField";
import { slugField } from "@/fields/slug";
import { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",

  // tree: true,
  labels: {
    singular: {
      en: "Category",
      vi: "Danh mục",
    },
    plural: {
      en: "Categories",
      vi: "Danh mục",
    },
  },
  admin: {
    useAsTitle: "title",
    group: {
      vi: "Danh Mục",
      en: "Categories",
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  defaultSort: "slug",
  // defaultPopulate: ["title", "description", "slug"],
  // defaultPopulate: ["title", "description", "slug"],
  hooks: {
  },
  fields: [...baseField, ...slugField("title", {}, false)],
};
