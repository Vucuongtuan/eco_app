import { Breadcrumbs } from "@/components/Breadcrumbs";
import MetaTitle from "@/components/MetaTitle";
import ProductList from "@/components/ProductList";
import { findCategoryBySlug, findListProductByCategory } from "@/service/pages";
import { Lang } from "@/types";
import { generateMeta } from "@/utilities/generateMeta";
import { genStaticParams } from "@/utilities/generateStaticParam";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

// Generate static params for all categories
//    - vi, en
// @returns {Promise<{ slug: string; lang: string }[]>}
export async function generateStaticParams() {
  return genStaticParams({ collection: "categories" });
}

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}
export default async function PageCollection({ params }: Props) {
  "use memo"; // react compiler mode
  const { lang, slug } = await params;

  const category = await findCategoryBySlug({ slug, lang: lang as Lang });

  if (!category || !category.id) return notFound();
  const products = await findListProductByCategory({
    lang: lang as Lang,
    slug,
    categoryId: category.id,
  });
  return (
    <>
      {/* Breadcrumbs */}
      <section className="max-w-screen-3xl mx-auto px-6 md:px-16 py-5 ">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: category.title,
              href: `/collections/${category.slug}`,
            },
          ]}
        />
      </section>

      {/* Title Category */}
      <MetaTitle
        title={category.title}
        description={category.description || ""}
      />
      {/* <ListProduct data={products} /> */}
      {!products ? null : (
        <Suspense>
          <ProductList
            categoryId={category.id}
            initData={products}
            lang={lang as Lang}
          />
        </Suspense>
      )}
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug, lang } = await params;
  const category = await findCategoryBySlug({
    slug,
    lang: lang as Lang,
  });
  const meta = await generateMeta({ doc: category, lang: lang as Lang });
  return meta;
}
