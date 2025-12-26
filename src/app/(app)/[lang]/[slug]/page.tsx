// import { MobileNav } from "@/components/layout/Header/MobileNav";
import { RenderBlocks } from "@/blocks/(web)/RenderBlocks";
import MetaTitle from "@/components/MetaTitle";
import { query } from "@/lib/tryCatch";
import { Page } from "@/payload-types";
import { findPageDoc } from "@/service/pages";
import { Lang } from "@/types";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PaginatedDocs } from "payload";

function isPage(doc: Page | Error): doc is Page {
  return !(doc instanceof Error);
}

interface PageProps {
  params: Promise<{
    lang: Lang;
    slug: string;
  }>;
}

export default async function PageTemplate({ params }: PageProps) {
  await cookies();

  const { lang, slug = "" } = await params;
  const isHomepage = slug === "";
  const doc = await findPageDoc(lang, isHomepage ? "home" : slug);

  if (!doc || doc instanceof Error) {
    return notFound();
  }

  return (
    <>
      {!isHomepage ? (
        <MetaTitle title={doc.title} align="center" />
      ) : (
        <h1 className="sr-only">{doc?.meta?.title || doc?.title}</h1>
      )}
      <RenderBlocks blocks={doc.sections} lang={lang as Lang} />
    </>
  );
}

export async function generateStaticParams() {
  const [result, err] = await query<PaginatedDocs<Page>>((payload) => {
    return payload.find({
      collection: "pages",
      where: {
        status: {
          equals: "published",
        },
        slug: {
          not_equals: "home",
        },
      },
      pagination: {
        limit: 0,
      },
      select: {
        slug: true,
      },
    });
  });

  if (err || !result) {
    console.log(err);
    return [
      { lang: "en" as const, slug: "/" }, // /en/home
      { lang: "vi" as const, slug: "/" },
    ];
  }

  const params = result.docs.flatMap((doc) => [
    { lang: "en" as const, slug: doc.slug },
    { lang: "vi" as const, slug: doc.slug },
  ]);

  params.push({ lang: "en" as const, slug: "/" });
  params.push({ lang: "vi" as const, slug: "/" });

  return params;
}
