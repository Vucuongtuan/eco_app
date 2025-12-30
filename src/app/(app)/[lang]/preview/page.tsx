import { RenderBlocks } from "@/blocks/(web)/RenderBlocks";
import Article from "@/components/Article/Article";
import { query } from "@/lib/tryCatch";
import { Page, Post } from "@/payload-types";
import { Lang } from "@/types";
import { PaginatedDocs } from "payload";
import { ReloadOnSave } from "./ReloadOnSave";

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    slug: string;
    collection: string;
    locale: string;
    previewSecret: string;
    path: string;
  }>;
}) {
  const { slug, collection, locale, previewSecret, path } = await searchParams;
  const [result, err] = await query<PaginatedDocs<Page | Post>>((payload) => {
    return payload.find({
      collection,
      where: {
        slug: {
          equals: slug,
        },
      },
      locale: locale,
      draft: true,
    });
  });
  if (err || !result || result.docs.length === 0) throw err;
  const data = result.docs[0] as Page | Post;

  return (
    <>
      <ReloadOnSave />
      {collection === "pages" ? (
        <RenderBlocks blocks={(data as Page).sections} lang={locale as Lang} />
      ) : (
        <Article post={data as Post} />
      )}
    </>
  );
}
