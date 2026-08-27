import { notFound } from "next/navigation";
import { Breadcrumb, Image } from "@/components/common";
import { getCollectionAction } from "@/services/actions";
import { CollectionProductGrid } from "@/components/CollectionProductGrid";
import { CollectionFilterDrawer } from "@/components/CollectionFilterDrawer";
import { generateMetadata as createMetadata } from "@/utils/generateMetadata";
import { absoluteUrl, collectionJsonLd } from "@/utils/structured-data";
import { JsonLd } from "@/components/Seo/JsonLd";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionAction(slug, { first: 1 });
  return createMetadata({
    title: collection?.title,
    description: collection?.description,
    path: `/collections/${slug}`,
    image: collection?.image,
  });
}

export const instant = false;

function parseUrlFilters(searchParams: Record<string, string | string[] | undefined>) {
  const filters: Record<string, unknown>[] = [];
  const sortKey = typeof searchParams.sortKey === "string" ? searchParams.sortKey : undefined;
  const reverse = searchParams.reverse === "true";

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "sortKey" || key === "reverse" || !value) return;

    if (key === "price_min" || key === "price_max") {
      const priceFilter: Record<string, unknown> = {};
      if (searchParams.price_min) priceFilter.min = parseFloat(searchParams.price_min as string);
      if (searchParams.price_max) priceFilter.max = parseFloat(searchParams.price_max as string);
      if (Object.keys(priceFilter).length > 0) {
        filters.push({ price: priceFilter });
      }
      return;
    }

    const valArray = typeof value === "string" ? value.split(",") : value;
    valArray.forEach((v) => {
      try {
        const parsed = JSON.parse(v);
        filters.push(parsed);
      } catch {
        // If not JSON, treat as standard filter input string
      }
    });
  });

  return { filters, sortKey, reverse };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const rawSearchParams = await searchParams;
  const { filters, sortKey, reverse } = parseUrlFilters(rawSearchParams);

  const collection = await getCollectionAction(slug, {
    first: 24,
    filters,
    sortKey,
    reverse,
  });

  if (!collection) notFound();
  const collectionFilters = collection.products?.filters ?? [];

  return (
    <main className="mx-auto w-full max-w-screen-3xl py-24">
      <JsonLd data={collectionJsonLd({ name: collection.title, url: absoluteUrl(`/collections/${collection.handle}`), description: collection.description })} />
      <header className="mb-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-end px-5 sm:px-6 lg:px-12">
        <div>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: collection.title }]} />
          <h1 className="mt-6 text-2xl font-normal tracking-tight md:text-4xl">{collection.title}</h1>
          {collection.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{collection.description}</p> : null}
        </div>
      </header>

      <section className="border-t-[0.5px] border-gray-600">
        <CollectionFilterDrawer filters={collectionFilters} />
        {collection.products?.nodes.length ? (
          <div className="pt-6">
            <CollectionProductGrid handle={slug} initialData={collection.products} />
          </div>
        ) : (
          <p className="py-20 text-center text-gray-500">No products found matching your filters.</p>
        )}
      </section>
    </main>
  );
}
