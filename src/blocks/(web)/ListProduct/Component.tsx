import { cn } from "@/lib/utils";
import { ListProductsBlock, Product } from "@/payload-types";
import { FindProductByType, findProductListByType } from "@/service/blocks";
import { Lang } from "@/types";
import { layoutCtn } from "@/utilities/cssVariable";
import CarouselListProduct from "./CarouselListProduct";
import GridComp from "./Grid";

interface Props extends ListProductsBlock {
  lang: Lang;
}

export default async function ListProductsComp(props: Props) {
  const {
    title,
    description,
    type,
    products,
    categories,
    hashTag,
    configs,
    lang,
    //@ts-expect-error
    enableMedia,
    //@ts-expect-error
    media,
    //@ts-expect-error
    caption,
  } = props;
  let data;
  if (type === "products") {
    data = products;
  } else {
    const result = await findProductListByType({
      type,
      categories: categories || [],
      tags: hashTag || [],
      options: { limit: 16, page: 1 },
      lang
    } as FindProductByType);
    data = result || [];
  }
  if (!data || data.length === 0) return null;
  return (
    <div className={cn(layoutCtn(configs?.layout || "container"),' relative')}>
      <header
        className={cn(
          (configs?.layout && configs?.layout !== "full") ||
            configs?.layout !== "wide"
            ? "text-left"
            : "text-center",
          "p-8  text-xl w-full"
        )}
      >
        <h2 className={cn()}>{title}</h2>
        <p>{description}</p>
      </header>
      {configs && configs.ui === "grid" && (
        <GridComp gap={configs.gap || 20} data={data as Product[]} lang={lang} />
      )}
      {configs && configs.ui === "carousel" && (
        <CarouselListProduct
          gap={configs.gap || 20}
          data={data as Product[]}
          lang={lang}
          enableMedia={enableMedia}
          media={media}
          caption={caption}
          />
      )}
    </div>
  );
}
