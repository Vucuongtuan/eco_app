import { ProductCard } from "@/components/Card";
import { Breadcrumb } from "@/components/common";
import { searchProductsAction } from "@/services/actions";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const instant = false;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  "use memo";
  const query = (await searchParams).q?.trim() ?? "";
  const products = query ? await searchProductsAction(query) : { nodes: [] };

  return (
    <main className="mx-auto w-full max-w-screen-3xl px-5 py-32 sm:px-6 lg:px-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <header className="mt-8 border-b border-gray-300 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Search results
        </p>
        <h1 className="mt-3 text-3xl font-light tracking-tight md:text-5xl">
          {query ? `Results for “${query}”` : "Search products"}
        </h1>
      </header>

      {products.nodes.length ? (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.nodes.map((product) => {
            const variant = product.variants?.nodes[0];
            if (!variant) return null;
            return (
              <li key={product.id}>
                <ProductCard
                  href={`/products/${product.handle}`}
                  title={product.title}
                  image={product.featuredImage}
                  price={product.priceRange.minVariantPrice}
                  variants={[
                    {
                      id: variant.id,
                      price: variant.price,
                      image: variant.image ?? product.featuredImage,
                      images: product.images?.nodes,
                      sizes: product.variants?.nodes.map((item) => ({
                        label: item.title,
                        available: item.availableForSale,
                      })),
                    },
                  ]}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-24 text-center text-sm text-gray-500">
          {query ? "No products found." : "Enter a product name to search."}
        </p>
      )}
    </main>
  );
}
