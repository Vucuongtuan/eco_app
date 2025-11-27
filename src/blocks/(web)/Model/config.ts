import { Block } from "payload";

export interface ModelBlock{
    title:string,
    content:any
}

export const Model:Block = {
    slug:"Model",
    interfaceName:"ModelBlock",
    fields:[
  
                {
                    name:"title",
                    type:"text",
                    required:true,
                    localized:true,
                },
                {
                    name:"content",
                    type:"richText",
                    localized:true,
                },
            
    ]
}