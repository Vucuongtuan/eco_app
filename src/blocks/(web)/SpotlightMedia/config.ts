import { layout } from "@/fields/layout";
import { link } from "@/fields/link";
import { spacingField } from "@/fields/spacingField";
import { Category, Media, Page, Product } from "@/payload-types";
import { Block } from "payload";


export interface SpotlightMediaBlock  {
    title:string
    features:{
          type?: ('reference' | 'custom') | null;
          newTab?: boolean | null;
          reference?:
            | ({
                relationTo: 'pages';
                value: string | Page;
              } | null)
            | ({
                relationTo: 'categories';
                value: string | Category;
              } | null)
            | ({
                relationTo: 'products';
                value: string | Product;
              } | null);
          url?: string | null;
          label: string;
          /**
           * Choose how the link should be rendered.
           */
          appearance?: ('default' | 'outline') | null;
        }[],
        configs:any,
        media:Media
}


export const SpotlightMedia:Block = {
    slug:"SpotlightMedia",
    interfaceName:"SpotlightMediaBlock",
    fields:[
        {
            type:"tabs",
            tabs:[
                {
                    label:"General",
                    fields:[
                        {
            name:"title",
            type:"text",
        },
        {
            name:"media",
            type:"upload",
            relationTo:"media",
            required:true
        },
        {
            type:"array",
            name:"features",
            interfaceName: "SpotlightMediaFeatures",
            fields:[
                link({
                    localeLabel:true
                }),
            ]                
        }
                    ]
                },{
                    name:"configs",
                    label:"Configs",
                    fields:[
                        layout,
                        ...spacingField({localized:false})
                    ]
                }
            ]
        }
    ]
}