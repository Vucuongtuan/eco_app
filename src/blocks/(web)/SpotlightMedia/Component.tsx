import { CMSLink } from "@/components/Link";
import { Media } from "@/components/Media";
import { cn } from "@/lib/utils";
import { Media as MediaType } from "@/payload-types";
import { layoutCtn } from "@/utilities/cssVariable";
import { SpotlightMediaBlock } from "./config";


export default function SpotlightMediaComponent(props:SpotlightMediaBlock) {
    const {title,features,configs,media} = props
    console.log({features})
    return (
        <div className={cn(layoutCtn(configs.layout || 'container'),)}>
            <div className="relative w-full h-screen">
                <Media resource={media as MediaType} imgSize="large" fClassName="relative w-full h-full" fill/>

                {/* render title,feature links   */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-8 md:p-12">
                    {title && (
                        <h2 className="text-white text-3xl md:text-5xl font-bold mb-6">
                            {title}
                        </h2>
                    )}
                    {features && features.length > 0 && (
                        <div className="flex flex-wrap gap-4 items-center">
                            {features.map((f:any, index) => (
                                <>
                                <CMSLink
                                    key={f.id}
                                    className="text-white px-0"
                                    {...f.link}
                                />
                                {
                                    index < features.length - 1 && (
                                        <span className="text-white">{'>'}</span>
                                    )
                                }
                                </>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}