import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/common";
import { getArticleAction, getPageAction, getPagesAction } from "@/services/actions";
import { generateMetadata as createMetadata } from "@/utils/generateMetadata";

type DynamicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const pages = await getPagesAction().catch(() => [] as { handle: string }[]);
  const params = pages.map((p) => ({ slug: p.handle }));
  // Fallback: must return at least 1 result when cacheComponents is enabled
  return params.length > 0 ? params : [{ slug: "_placeholder" }];
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const { slug } = await params;
  const page = await getPageAction(slug).catch(() => null);
  if (!page) return {};

  return createMetadata({
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    path: `/pages/${page.handle}`,
  });
}

export const instant = false;

export default async function DynamicPage({ params }: DynamicPageProps) {
  "use cache";
  const { slug } = await params;
  cacheLife("max");
  cacheTag("shopify-pages", `shopify-page:${slug}`);

  // 1. Try fetching standard Shopify Page
  let page: { title: string; body: string; handle: string } | null = await getPageAction(
    slug,
  ).catch(() => null);

  // 2. Fallback: If not found, fetch Article under 'pages' blog
  if (!page) {
    const article = await getArticleAction("pages", slug).catch(() => null);
    if (article) {
      page = {
        title: article.title,
        body: article.contentHtml,
        handle: article.handle,
      };
    }
  }

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-screen-xl px-5 py-16 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <header className="mt-8 mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900 md:text-5xl">
          {page.title}
        </h1>
      </header>

      <article
        className="prose prose-neutral max-w-none prose-headings:font-light prose-a:text-black prose-a:underline prose-img:rounded-md leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </main>
  );
}
