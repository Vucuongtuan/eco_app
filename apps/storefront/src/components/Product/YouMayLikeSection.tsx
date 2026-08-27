import { ProductCard } from "@/components/Card";
import { getProductsUncached } from "@/lib/shopify";

type YouMayLikeSectionProps = {
  currentHandle: string;
};

export async function YouMayLikeSection({ currentHandle }: YouMayLikeSectionProps) {
  const { nodes } = await getProductsUncached({ first: 8, sortKey: "BEST_SELLING" });
  const products = nodes.filter((product) => product.handle !== currentHandle).slice(0, 4);

  if (!products.length) return null;

  return (
    <section className="mx-auto  py-16  lg:py-24" aria-labelledby="you-may-like-title">
      <h2 id="you-may-like-title" className="px-12 mb-8 text-xl font-medium tracking-tight sm:text-2xl">You may also like</h2>
      <div className="grid grid-cols-2 gap-x-0.5 gap-y-10 lg:grid-cols-4">
        {products.map((product) => {
          const variant = product.variants?.nodes[0];
          if (!variant) return null;

          return (
            <ProductCard
              key={product.id}
              title={product.title}
              href={`/products/${product.handle}`}
              image={product.featuredImage}
              price={product.priceRange.minVariantPrice}
              variants={[{ id: variant.id, title: product.title, href: `/products/${product.handle}`, price: variant.price, image: variant.image ?? product.featuredImage, sizes: (product.variants?.nodes ?? []).map((item) => ({ label: item.selectedOptions.find((option) => option.name.toLowerCase() === "size")?.value ?? item.title, available: item.availableForSale })) }]}
            />
          );
        })}
      </div>
    </section>
  );
}
