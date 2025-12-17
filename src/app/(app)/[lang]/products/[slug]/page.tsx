import ProductDetails from "@/components/(product-details)/ProductDetails";
import { CarouselListProduct } from "@/components/CarouselProduct";
import Review from "@/components/Review";
import { Category, Product, Tag } from "@/payload-types";
import {
  findListProducts,
  findProductBySlug,
  findSlugAllProduct,
} from "@/service/products";
import { Lang } from "@/types";
import { generateMeta } from "@/utilities/generateMeta";
import { Suspense } from "react";

/*
 * Generate static params for all products
 *    - vi, en
 * @returns {Promise<{ slug: string; lang: string }[]>}
 */
export async function generateStaticParams() {
  const products = await findSlugAllProduct();
  return products.flatMap((item) => [
    { slug: item.slug },
    { slug: item.slug, lang: "en" },
  ]);
}


async function getRelatedProducts(product: Product, lang: Lang) {
  const slugCategory = (product.taxonomies?.category as Category[]).map((item) => item.slug) as string[];
  const tags = product.taxonomies?.tags || [];

  if (!slugCategory && tags.length === 0) return [];

  const related = await findListProducts({
    slugCategory: slugCategory,
    tags: tags as Tag[],
    lang,
    limit: 8,
    page: 1,
  });

  return related.filter((item) => item.slug !== product.slug);
}

interface Props {
  params: Promise<{ slug: string; lang: string }>;
}

export default async function ProductPage({ params }: Props) {
  "use memo"; // react compiler mode **annotation**
  const { slug, lang } = await params;
  const product = await findProductBySlug({ slug, lang: lang as Lang });
  let dataRelatest;
  if (
    product.relatedByCategory ||
    product.relatedByTags ||
    product.relatedType
  ) {
    dataRelatest = await getRelatedProducts(product, lang as Lang);
  } else {
    dataRelatest = null;
  }

  return (
    <>
      <ProductDetails doc={product} lang={lang as Lang} />

      {product.id && (
        <Suspense>
          <Review productId={product.id} />
        </Suspense>
      )}
      {dataRelatest && (
        <Suspense>
          <CarouselListProduct items={dataRelatest || []} lang={lang as Lang} />
        </Suspense>
      )}
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug, lang } = await params;
  const product = await findProductBySlug({
    slug,
    lang: lang as Lang,
  });
  const meta = await generateMeta({ doc: product, lang: lang as Lang });
  return meta;
}
