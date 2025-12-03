import { CollectionConfig } from "payload";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: {
    singular: {
      vi: "Đánh giá",
      en: "Review",
    },
    plural: {
      vi: "Đánh giá",
      en: "Reviews",
    },
  },
  admin: {
    group: {
      vi: "Sản phẩm",
      en: "Products",
    },
    defaultColumns: ["product", "user", "rating", "approved"],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      label: {
        vi: "Người đánh giá",
        en: "Reviewer",
      },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      label: {
        vi: "Sản phẩm",
        en: "Product",
      },
    },
    {
      name: "rating",
      type: "number",
      label: {
        vi: "Điểm đánh giá",
        en: "Rating",
      },
      min: 1,
      max: 5,
      admin: {
        condition: (data) => !data.parent, // Only show/require rating if not a reply
      },
    },
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: {
        vi: "Hình ảnh/Video",
        en: "Images/Videos",
      },
    },
    {
      name: "comment",
      type: "textarea",
      label: {
        vi: "Bình luận",
        en: "Comment",
      },
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "reviews",
      label: {
        vi: "Phản hồi của",
        en: "Reply To",
      },
    },
    {
      name: "replies",
      type: "relationship",
      relationTo: "reviews",
      hasMany: true,
      label: {
        vi: "Các phản hồi",
        en: "Replies",
      },
      admin: {
        condition: (data) => !data.parent, // Only show for root reviews
      },
    },
  ],
  hooks: {
  
  },
};
