import { CMSLink } from "@/components/Link";
import { Media } from "@/components/Media";
import { cn } from "@/lib/utils";
import { Media as MediaType } from "@/payload-types";
import { layoutCtn } from "@/utilities/cssVariable";
import { SpotlightMediaBlock } from "./config";

export default function SpotlightMediaComponent(props: SpotlightMediaBlock) {
  const { title, features, configs, media } = props;
  return (
    <div className={cn(layoutCtn(configs.layout || "container"))}>
      <div className="relative w-full aspect-card md:aspect-video">
        <Media
          resource={media as MediaType}
          imgSize="large"
          fClassName="relative w-full h-full"
          imgClassName={"object-cover"}
          fill
        />

        {/* render title,feature links   */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 md:p-12">
          {title && (
            <h2 className="text-white text-2xl md:text-5xl font-bold mb-2 md:mb-6">
              {title}
            </h2>
          )}
          {features && (
            <div className="flex gap-2">
              {features.map((feature, index) => (
                <CMSLink key={index} {...feature} isLink />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
