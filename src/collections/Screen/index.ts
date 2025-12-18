import { Content } from "@/blocks/(mobile)/Content/config";
import { Notification } from "@/blocks/(mobile)/Notifications/config";
import { ProductArchives } from "@/blocks/(mobile)/ProductsArchives/config";
import { CollectionConfig, slugField } from "payload";

export const Screen: CollectionConfig = {
  slug: "screen",
  admin: {
    group: "Mobile",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
    },
    slugField({ fieldToUse: "title" }),
    {
      name: "sections",
      type: "blocks",
      blocks: [Notification, ProductArchives, Content],
    },
  ],
  versions: {
    drafts: true,
  },
};
