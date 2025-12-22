import { afterReadContent } from "@/hooks/afterReadContent";
import { CollectionConfig, slugField } from "payload";
import { uploadCustomField } from "../../fields/upload";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: {
    singular: {
      vi: "Bài đăng",
      en: "Post",
    },
    plural: {
      vi: "Bài đăng",
      en: "Posts",
    },
  },
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Title",
    },
    {
      name: "description",
      type: "textarea",
    },
    slugField({
      fieldToUse: "title",
    }),
    {
      name: "content",
      type: "richText",
      label: "Content",
      hooks: {
        afterRead: [afterReadContent],
      },
    },
    uploadCustomField({
      name: "image",
      label: { vi: "Ảnh đại diện", en: "Featured Image" },
      required: true,
    }),
    {
      type: "relationship",
      relationTo: ["products"],
      label: {
        vi: "Sản phẩm",
        en: "Product",
      },
      hasMany: true,
      name: "linkedProducts",
    },
  ],
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  versions: true,
};
