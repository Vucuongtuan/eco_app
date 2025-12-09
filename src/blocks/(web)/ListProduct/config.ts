import { defaultLexical } from "@/fields/defaultLexical";
import { layout } from "@/fields/layout";
import { spacingField } from "@/fields/spacingField";
import { Block } from "payload";

export const ListProducts: Block = {
  slug: "ListProducts",
  interfaceName: "ListProductsBlock",
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              localized: true,
            },
            {
              name: "description",
              type: "text",
              localized: true,
            },
            {
              name: "type",
              type: "select",
              options: [
                {
                  label: "Categories",
                  value: "categories",
                },
                {
                  label: "Products",
                  value: "products",
                },
              ],
              defaultValue: "categories",
              required: true,
            },
           
            {
              name: "categories",
              type: "relationship",
              relationTo: "categories",
              admin: {
                condition: (_, { type }) => type === "categories",
              },
            },
            {
              name: "products",
              type: "relationship",
              relationTo: "products",
              hasMany: true,
              admin: {
                condition: (_, { type }) => type === "products",
              },
            },
             {
              name:"enableMedia",
              type:"checkbox",
              defaultValue:false
            },
            {
              name:"media",
              type:"upload",
              relationTo:"media",
              admin:{
                condition:(_, { configs ,enableMedia}) => configs?.ui === 'carousel' && enableMedia ,
              }
            },
            {
              name:"caption",
              type:"richText",
              localized:true,
                  editor: defaultLexical({
                    headingSizes: ["h2", "h3", "h4"],
                    enableHeading: true,
                    enableTextState: true,
                    enableLink: true,
                    enableTable: true,
                    enableBlock: true,
                  }),
              admin:{
                condition:(_, { configs ,enableMedia}) => configs?.ui === 'carousel' && enableMedia ,
              }
            },
          ],
        },
        {
          label: "Configs",
          name: "configs",
          fields: [
            layout,
            ...spacingField({ localized: false }),
            {
              name: "ui",
              type: "radio",
              options: [
                {
                  label: "Grid",
                  value: "grid",
                },
                {
                  label: "Carousel",
                  value: "carousel",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
