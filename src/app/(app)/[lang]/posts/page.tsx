import ArchivesList from "@/components/Archives/ArchivesList";
import MetaTitle from "@/components/MetaTitle";
import { findLatestPostByLang } from "@/service/actions";
import { Lang } from "@/types";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";



export async function generateStaticParams() {
  return [{ lang: "vi" }, { lang: "en" }];
}

export default async function PostsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  "use memo";
  const { lang } = await params;
  const docs = await findLatestPostByLang(lang as Lang)
  const t = await getTranslations("posts");

  if (!docs || docs.docs.length === 0) {
    return (
      <section className="container min-h-[90vh] flex py-12">
        <h1 className="text-2xl font-bold">{t("notFound")}</h1>
      </section>
    );
  }

  return (
    <>
       <MetaTitle
            title={t("title")}
            description={t("description")}
            className="py-16 space-y-2"
          />
          <ArchivesList initData={docs} lang={lang as Lang}/>
    </>
  );
}
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("posts");

  return {
    title: t("title") || "Posts",
    description: t("description") ,
  };
}