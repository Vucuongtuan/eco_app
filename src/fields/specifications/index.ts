import { Field } from "payload";

export const specificationsField = (): Field => ({
  name: "specifications",
  label: {
    vi: "Thông số kỹ thuật",
    en: "Specifications",
  },
  type: "array",
  interfaceName: "SpecificationsArray",
  labels: {
    singular: {
      vi: "Thông số",
      en: "Specification",
    },
    plural: {
      vi: "Các thông số",
      en: "Specifications",
    },
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      label: {
        vi: "Tên thông số",
        en: "Specification Name",
      },
      admin: {
        width: "50%",
      },
    },
    {
      name: "value",
      type: "text",
      required: true,
      label: {
        vi: "Giá trị",
        en: "Value",
      },
      admin: {
        width: "50%",
      },
    },
  ],
});
