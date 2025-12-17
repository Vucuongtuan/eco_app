import { Block } from "payload";



export const ProductArchives: Block = {
  slug: "mobile-product-archives",
  interfaceName:"MobileProductArchivesProps",
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
        name:"type",
        type:"select",
        options:[
            {
                label:"Category",
                value:"category",
            },
            {
                label:"Product",
                value:"product",
            },
            {
              label:"New",
              value:"new",
            }
        ]
    },
    {
        name:"category",
        type:"relationship",
        relationTo:"categories",
        admin:{
            condition: (_, { type } = {}) => type === "category",
        }
    },
    {
        name:"product",
        type:"relationship",
        relationTo:"products",
        admin:{
            condition: (_, { type } = {}) => type === "product",
        }
    }
  ],
}