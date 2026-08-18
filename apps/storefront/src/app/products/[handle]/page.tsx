import NextImage from "next/image";
import { notFound } from "next/navigation";
import { ProductDetailInfo } from "@/components/Product/ProductDetailInfo";
import { getProduct } from "@/lib/shopify";
import { thumbhashToDataUrl } from "@/lib/thumbhash";

export const instant = false;

type ProductPageProps = { params: Promise<{ handle: string }> };

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) notFound();

  const images = product.images.nodes.length
    ? product.images.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  return (
    <main>
      <section className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-0 self-start">
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
        </div>

        <div className="px-6 py-10 sm:px-10 lg:sticky lg:top-24 lg:self-start lg:px-16 lg:py-16">
          <ProductDetailInfo product={product} />
        </div>
      </section>
    </main>
  );
}
