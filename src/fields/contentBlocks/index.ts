import { afterReadContent } from "@/hooks/afterReadContent";
import { Block, Field } from "payload";
import { defaultLexical } from "../defaultLexical";

const RichTextBlock: Block = {
  slug: "richText",
  labels: {
    singular: { vi: "Khối văn bản", en: "Rich Text Block" },
    plural: { vi: "Các khối văn bản", en: "Rich Text Blocks" },
  },
  fields: [
    {
      name: "content",
      type: "richText",
      editor: defaultLexical(),
      hooks: {
        afterRead: [afterReadContent],
      },
    },
  ],
};

// const ImageBlock: Block = {
//   slug: "image",
//   labels: {
//     singular: { vi: "Khối ảnh", en: "Image Block" },
//     plural: { vi: "Các khối ảnh", en: "Image Blocks" },
//   },
//   fields: [
//     {
//       name: "image",
//       type: "upload",
//       relationTo: "media",
//       required: true,
//       label: { vi: "Hình ảnh", en: "Image" },
//     },
//     {
//       name: "caption",
//       type: "text",
//       label: { vi: "Chú thích", en: "Caption" },
//     },
//   ],
// };

// const CallToActionBlock: Block = {
//   slug: "cta",
//   labels: {
//     singular: { vi: "Khối kêu gọi hành động", en: "Call to Action" },
//     plural: { vi: "Các khối kêu gọi hành động", en: "Call to Actions" },
//   },
//   fields: [
//     {
//       name: "title",
//       type: "text",
//       required: true,
//       label: { vi: "Tiêu đề", en: "Title" },
//     },
//     {
//       name: "text",
//       type: "textarea",
//       label: { vi: "Nội dung", en: "Text" },
//     },
//     {
//       name: "button",
//       type: "group",
//       label: { vi: "Nút bấm", en: "Button" },
//       fields: [
//         {
//           name: "label",
//           type: "text",
//           required: true,
//           label: { vi: "Nhãn nút", en: "Button Label" },
//         },
//         {
//           name: "url",
//           type: "text",
//           required: true,
//           label: { vi: "Đường dẫn", en: "URL" },
//         },
//       ],
//     },
//   ],
// };

export const contentBlocksField = (): Field => ({
  name: "layout",
  type: "blocks",
  label: {
    vi: "Nội dung trang",
    en: "Page Content",
  },
  blocks: [RichTextBlock],
});
