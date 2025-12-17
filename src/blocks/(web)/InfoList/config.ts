import { layout } from "@/fields/layout";
import { spacingField } from "@/fields/spacingField";
import { Block } from "payload";

export interface InfoListBlock{
    array: {
        title:string,
        description:string,
        image:string
    }[],
    configs:any
}


export const InfoList:Block = {
    slug: 'InfoList',
    interfaceName:"InfoListBlock",
    fields:[
        {
            type:"tabs",
            tabs:[
                {
                    label:"General",
                    fields:[
                          {
            name:"array",
            type:"array",
            interfaceName: "InfoListArray",
            fields:[
                {
                    name:"title",
                    type:"text",
                    required:true,
                    localized:true,
                },
                {
                    name:"description",
                    type:"text",
                    localized:true,
                },
                {
                    name:"image",
                    type:"upload",
                    relationTo:"media"
                }
            ]
        }
                    ]
                },
                {
                    label:"Configs",
                    name:"configs",
                    fields:[
                        layout,
                        ...spacingField({localized:false})
                    ]
                }
            ]
        }
      
    ]

}