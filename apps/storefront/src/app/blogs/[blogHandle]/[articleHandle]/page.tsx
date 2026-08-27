import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/common";
import { getArticleAction } from "@/services/actions";
import { generateMetadata as createMetadata } from "@/utils/generateMetadata";

type ArticlePageProps = {
  params: Promise<{ blogHandle: string; articleHandle: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps) {
  const { blogHandle, articleHandle } = await params;
  const article = await getArticleAction(blogHandle, articleHandle).catch(() => null);
  if (!article) return {};

  return createMetadata({
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt || undefined,
    path: `/blogs/${blogHandle}/${article.handle}`,
    image: article.image ? { url: article.image.url } : undefined,
  });
}

export const instant = false;

export default async function ArticlePage({ params }: ArticlePageProps) {
  "use cache";
  const { blogHandle, articleHandle } = await params;
  cacheLife("weeks");
  cacheTag("shopify-blogs", `shopify-blog:${blogHandle}`, `shopify-article:${articleHandle}`);
  const article = await getArticleAction(blogHandle, articleHandle).catch(() => null);

  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-screen-lg px-5 py-16 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blogs", href: `/blogs/${blogHandle}` },
          { label: article.title },
        ]}
      />

      <header className="mt-8 mb-10 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 text-xs text-gray-500 uppercase tracking-widest mb-3">
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          {article.authorV2?.name && (
            <>
              <span>•</span>
              <span>{article.authorV2.name}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-light tracking-tight text-gray-900 md:text-5xl leading-tight">
          {article.title}
        </h1>
      </header>

      {article.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg mb-12 bg-gray-100">
          <Image
            src={article.image.url}
            alt={article.image.altText || article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover"
          />
        </div>
      )}

      <article
        className="prose prose-neutral max-w-none prose-headings:font-light prose-a:text-black prose-a:underline prose-img:rounded-lg leading-relaxed text-gray-700 mx-auto"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {article.tags.length > 0 && (
        <footer className="mt-12 pt-6 border-t border-gray-100 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags:</span>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </main>
  );
}
