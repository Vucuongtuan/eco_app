import { Block } from "payload";

export const Notification: Block = {
  slug: "mobile-notification",
  interfaceName: "MobileNotificationProps",
  fields: [
    {
      name: "title",
      type: "text",
      label: "Title VN",
    },
    {
      name: "title_en",
      type: "text",
      label:"Title EN",
    },
    {
      name: "description",
      type: "text",
      label:"Description VN",
    },
    {
      name: "description_en",
      type: "text",
      label:"Description EN",
    },
    {
      name:"media",
      type:"upload",
      relationTo:"media",
    }
  ],
};
