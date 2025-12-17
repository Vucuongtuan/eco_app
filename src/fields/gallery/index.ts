import { ArrayField } from "payload";
import { navItem } from "../navItem";

type GalleryField = (isLink?: boolean, isContent?: boolean) => ArrayField;

export const galleryField: GalleryField = (
  isLink: boolean = false,
  isContent: boolean = false,
): ArrayField => {
  const fields: any[] = [];

  if (isLink) {
    fields.push({
      name: "link",
      type: "group",
      interfaceName: "GalleryLinkGroup",
      label: {
        vi: "Liên kết",
        en: "Link",
      },
      fields: [...navItem({ isNav: false })],
    });
  }
  if (isContent) {
    fields.push(
      {
        name: "title",
        type: "text",
        label: {
          vi: "Tiêu đề",
          en: "Title",
        },
      },
      {
        name: "description",
        type: "textarea",
        label: {
          vi: "Mô tả",
          en: "Description",
        },
      },
      {
        name: "cta",
        type: "group",
        interfaceName: "GalleryCtaGroup",
        label: {
          vi: "Liên kết",
          en: "Link",
        },
        fields: [...navItem({ isNav: false })],
      },
    );
  }

  return {
    name: "gallery",
    type: "array",
    interfaceName: "GalleryArray",
    fields: [
      {
        name: "image",
        type: "upload",
        relationTo: "media",
        required: true,
        label: { vi: "Hình ảnh", en: "Image" },
      },
      ...fields,
    ],
  };
};
