import { defaultLexical } from "@/fields/defaultLexical";
import { Block } from "payload";





export const Content: Block = {
    slug:"mobile-content",
    interfaceName:"MobileContentProps",
    fields:[
        {
            name:"title",
            type:"text",
            label:"Title VN",
        },
        {
            name:"title_en",
            type:"text",
            label:"Title EN",
        },
        {
            name:"description",
            type:"text",
            label:"Description VN",
        },
        {
            name:"description_en",
            type:"text",
            label:"Description EN",
        },
        {
            name:"content",
            type:"richText",
            label:"Content VN",
             editor: defaultLexical({
                  headingSizes: ["h2", "h3", "h4"],
                  enableHeading: true,
                  enableTextState: true,
                  enableLink: true,
                  enableTable: true,
                  enableBlock: true,
                }),
             
        },
        {
            name:"content_en",
            type:"richText",
            label:"Content EN",
             editor: defaultLexical({
      headingSizes: ["h2", "h3", "h4"],
      enableHeading: true,
      enableTextState: true,
      enableLink: true,
      enableTable: true,
      enableBlock: true,
    }),

        },
        
    ]
}