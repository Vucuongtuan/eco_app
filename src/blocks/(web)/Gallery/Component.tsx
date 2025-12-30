import { CMSLink } from "@/components/Link";
import { Media } from "@/components/Media";
import { cn } from "@/lib/utils";
import { GalleryBlockProps, Media as MediaType } from "@/payload-types";

export default function GalleryComponent({ gallery }: GalleryBlockProps) {
  const colSpanMap: Record<number, string> = {
    1: "col-span-12",
    2: "col-span-6",
    3: "col-span-4",
    4: "col-span-6",
  };

  if (!gallery) return null;

  const gridClass = colSpanMap[gallery?.length] || "col-span-12";

  return (
    <ul className="grid grid-cols-12 gap-1">
      {gallery &&
        gallery.map((item, index) => (
          <li key={index} className={cn(gridClass, "relative")}>
            <CMSLink {...item.link} isLink className=" p-0 relative h-full">
              <Media
                resource={item.image as MediaType}
                imgSize="large"
                imgClassName="object-cover"
                fClassName="aspect-square"
                fill
              />
              <div className="absolute inset-0 bg-black/10 flex items-end justify-start p-2 md:p-5">
                <h3 className="text-base md:text-lg font-display text-white">
                  {item.link?.label}
                </h3>
              </div>
            </CMSLink>
          </li>
        ))}
    </ul>
  );
}
