import { slugField } from "@/fields/slug";
import { revalidatePath } from "next/cache";
import { CollectionConfig } from "payload";
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
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        console.log("Post saved:", doc.title);
        // /en
        revalidatePath(`/en/posts/${doc.slug}`);
        // /vi
        revalidatePath(`/posts/${doc.slug}`);
        // posts pages
        revalidatePath(`/en/posts`);
        revalidatePath(`/posts`);

        // sitemap

        req.payload.logger.info("✅ Revalidated post and posts listing pages");
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Title",
      localized: true,
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
    },
    ...slugField(),
    {
      name: "content",
      type: "richText",
      label: "Content",
      localized: true,
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
  versions: {
    drafts: {
      schedulePublish: {
        timeIntervals: 30,
      },
    },
  },
};
