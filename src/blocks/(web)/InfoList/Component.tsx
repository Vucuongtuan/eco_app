import { Media } from "@/components/Media"
import { cn } from "@/lib/utils"
import { layoutCtn } from "@/utilities/cssVariable"
import { InfoListBlock } from "./config"




export default function InfoListComponent(props:InfoListBlock) {
    const {array,configs} = props
    return (
        <div className={cn(layoutCtn(configs.layout || 'container'),'w-full py-12')}>
            <ul className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4">
                {array.map((item:any,index:number)=>(
                    <li key={index} className="w-full ">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <Media resource={item.image} imgSize="medium"  height={50} width={50}/>
                            <h2 className="text-2xl  text-center font-bold">{item.title}</h2>
                            <p className="text-gray-600 text-center ">{item.description}</p>
                        </div>     
                    </li>
                ))}
            </ul>
            
        </div>
    )
}