import { notFound } from "next/navigation";
import { Breadcrumb, Image } from "@/components/common";
import { getCollectionAction } from "@/services/actions";
import { CollectionProductGrid } from "@/components/CollectionProductGrid";
import { generateMetadata as createMetadata } from "@/utils/generateMetadata";
import { absoluteUrl, collectionJsonLd } from "@/utils/structured-data";
import { JsonLd } from "@/components/Seo/JsonLd";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionAction(slug, 1);
  return createMetadata({
    title: collection?.title,
    description: collection?.description,
    path: `/collections/${slug}`,
    image: collection?.image,
  });
}

export const instant = false;

const whiteList = ["men", "women", "kids", "accessories"];

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  // render page 
  // if (whiteList.includes(slug)) {
  //   return <><div>whitelist</div></>;
  // }

  const collection = await getCollectionAction(slug, 24);
  if (!collection) notFound();
  return (
    <main className="mx-auto w-full max-w-screen-3xl  py-24 ">
      <JsonLd data={collectionJsonLd({ name: collection.title, url: absoluteUrl(`/collections/${collection.handle}`), description: collection.description })} />
      <header className="mb-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-end px-5 sm:px-6 lg:px-12">
        <div>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: collection.title }]} />
          <h1 className="mt-6 text-2xl font-normal tracking-tight md:text-4xl">{collection.title}</h1>
          {collection.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{collection.description}</p> : null}
        </div>
      </header>

      <section className="border-t-[0.5px] border-gray-600">
        {collection.products.nodes.length ? <div className="pt-12"><CollectionProductGrid handle={slug} initialData={collection.products} /></div> : <p className="py-20 text-center text-gray-500">No products found in this collection.</p>}
        </section>
    </main>
  );
}
