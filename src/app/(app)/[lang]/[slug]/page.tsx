// import { MobileNav } from "@/components/layout/Header/MobileNav";
import { RenderBlocks } from "@/blocks/(web)/RenderBlocks";
import MetaTitle from "@/components/MetaTitle";
import { Page } from "@/payload-types";
import { findPageDoc } from "@/service/pages";
import { findLatestPostByLang } from "@/service/posts";
import { Lang } from "@/types";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

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
  const [vi, en] = await Promise.all([
    findLatestPostByLang("vi"),
    findLatestPostByLang("en"),
  ]);

  const langVi =
    vi instanceof Error
      ? []
      : vi.map((item) => ({ lang: "vi" as const, slug: item.slug }));
  const langEn =
    en instanceof Error
      ? []
      : en.map((item) => ({ lang: "en" as const, slug: item.slug }));

  const params = [...langVi, ...langEn];

  // Ensure at least one result for Cache Components
  return params.length > 0 ? params : [{ lang: "en" as const, slug: "home" }];
}
