import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/common";
import { getBlogAction } from "@/services/actions";
import { generateMetadata as createMetadata } from "@/utils/generateMetadata";

type BlogPageProps = {
  params: Promise<{ blogHandle: string }>;
};

export async function generateMetadata({ params }: BlogPageProps) {
  const { blogHandle } = await params;
  const blog = await getBlogAction(blogHandle).catch(() => null);
  if (!blog) return {};

  return createMetadata({
    title: blog.seo?.title || blog.title,
    description: blog.seo?.description || `Explore latest articles from ${blog.title}`,
    path: `/blogs/${blog.handle}`,
  });
}

export const instant = false;

export default async function BlogPage({ params }: BlogPageProps) {
  "use memo";

  "use cache";
  const { blogHandle } = await params;
  cacheLife("weeks");
  cacheTag("shopify-blogs", `shopify-blog:${blogHandle}`);
  const blog = await getBlogAction(blogHandle).catch(() => null);

  if (!blog) notFound();

  // Filter out static pages tagged as 'type:page' from general blog list
  const articles = (blog.articles?.nodes || []).filter(
    (article) => !article.tags.includes("type:page"),
  );

  return (
    <main className="mx-auto w-full max-w-screen-xl px-5 py-16 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: blog.title }]} />

      <header className="mt-8 mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900 md:text-5xl">
          {blog.title}
        </h1>
      </header>

      {articles.length ? (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col justify-between overflow-hidden"
            >
              <div>
                <Link
                  href={`/blogs/${blog.handle}/${article.handle}`}
                  className="block relative aspect-[16/10] overflow-hidden bg-gray-100 mb-4 rounded-md"
                >
                  {article.image ? (
                    <Image
                      src={article.image.url}
                      alt={article.image.altText || article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                      No cover image
                    </div>
                  )}
                </Link>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  {article.authorV2?.name && (
                    <>
                      <span>•</span>
                      <span>By {article.authorV2.name}</span>
                    </>
                  )}
                </div>

                <h2 className="text-xl font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                  <Link href={`/blogs/${blog.handle}/${article.handle}`}>{article.title}</Link>
                </h2>

                {article.excerpt && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>

              <Link
                href={`/blogs/${blog.handle}/${article.handle}`}
                className="mt-4 text-xs font-semibold uppercase tracking-wider text-black flex items-center gap-1 hover:gap-2 transition-all"
              >
                Read Article <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-gray-500">No articles published in this blog yet.</p>
      )}
    </main>
  );
}
