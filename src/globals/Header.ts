import type { GlobalConfig } from "payload";

import { link } from "@/fields/link";

export const Header: GlobalConfig = {
  slug: "header",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "logo",
      type: "relationship",
      relationTo: "media",
    },
    {
      name: "navItems",
      type: "array",
      interfaceName: "HeaderNavItems",
      fields: [
        link({
          appearances: false,
          localeLabel: true,
        }),
        {
          name: "child",
          type: "array",
          interfaceName: "HeaderNavItemChild",
          fields: [
            link({
              appearances: false,
              localeLabel: true,
            }),
            {
              name: "subChild",
              type: "array",
              interfaceName: "HeaderNavItemSubChild",
              fields: [
                link({
                  appearances: false,
                  localeLabel: true,
                }),
              ],
            },
          ],
        },
      ],
      maxRows: 6,
    },
  ],
};
