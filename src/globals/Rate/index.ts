import { GlobalConfig } from "payload";

export const Rate: GlobalConfig = {
  slug: "rate",
  admin: {
    description: {
      vi: "Tỷ giá chuyển đổi đựa trên giá gốc là VND",
      en: "Rate",
    },
    components: {
      elements: {
        SaveButton: "@/globals/Rate/Components#BtnChangeRate",
        // beforeDocumentControls: ["@/globals/Rate/Components#BtnChangeRate"],
      },
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "rates",
      type: "array",
      interfaceName: "RatesArray",
      fields: [
        {
          name: "currency",
          type: "text",
          admin: {
            description: {
              vi: "VD: USD,EUR,...",
            },
          },
        },
        {
          name: "rate",
          type: "number",
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
};
