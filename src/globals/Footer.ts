import type { GlobalConfig } from "payload";

import { link } from "@/fields/link";
import { revalidateTag } from "next/cache";

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ req }) => {
        revalidateTag("footer-vi");
        revalidateTag("footer-en");
      },
    ],
  },
  fields: [
    {
      name: "navItems",
      type: "array",
      interfaceName: "FooterNavItems",
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
};
