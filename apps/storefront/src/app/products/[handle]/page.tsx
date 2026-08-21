import NextImage from "next/image";
import { notFound } from "next/navigation";
import { ProductDetailInfo } from "@/components/Product/ProductDetailInfo";
import { getProductAction } from "@/services/actions";
import { thumbhashToDataUrl } from "@/lib/thumbhash";
import { generateMetadata as createMetadata } from "@/utils/generateMetadata";
import { absoluteUrl, productJsonLd } from "@/utils/structured-data";
import { JsonLd } from "@/components/Seo/JsonLd";

export const instant = false;

type ProductPageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductAction(handle);
  return createMetadata({
    title: product?.title,
    description: product?.descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    path: `/products/${handle}`,
    image: product?.featuredImage,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductAction(handle);

  if (!product) notFound();

  const images = product.images.nodes.length
    ? product.images.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  return (
    <main className="mt-16">
      <JsonLd data={productJsonLd({ name: product.title, url: absoluteUrl(`/products/${product.handle}`), image: product.featuredImage?.url, description: product.descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(), sku: product.variants.nodes[0]?.id, price: product.priceRange.minVariantPrice.amount, currency: product.priceRange.minVariantPrice.currencyCode, availability: product.variants.nodes.some((variant) => variant.availableForSale) })} />
      <article className="grid grid-cols-1 gap-0 lg:grid-cols-12">
        <section aria-label="Product images" className="grid grid-cols-2 gap-0 self-start lg:col-span-7">
          {images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="relative w-full">
              <NextImage
                src={image.url}
                alt={image.altText || product.title}
                width={image.width || 1200}
                height={image.height || 1600}
                sizes="(max-width: 1023px) 50vw, 25vw"
                className="h-auto w-full"
                placeholder={image.thumbhash ? "blur" : "empty"}
                blurDataURL={image.thumbhash ? thumbhashToDataUrl(image.thumbhash) ?? undefined : undefined}
              />
            </div>
          ))}
        </section>

        <aside className="lg:col-span-5 px-6 py-10 sm:px-10 lg:sticky lg:top-24 lg:self-start lg:px-16 lg:py-16">
          <ProductDetailInfo product={product} />
        </aside>
      </article>
    </main>
  );
}
