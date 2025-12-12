import ArticleTitle from "@/components/Article/ArticleTItle";
import Share from "@/components/Article/Share";
import { Media } from "@/components/Media";
import { RichText } from "@/components/RichText";
import { findPostBySlug, findPostDoc } from "@/service/posts";
import { Lang } from "@/types";
import { generateMeta } from "@/utilities/generateMeta";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await findPostDoc();
  
  if (posts instanceof Error || !posts) {
    return [
      { slug: "example", lang: "en" },
      { slug: "example", lang: "vi" },
    ];
  }

  return posts.flatMap((item) => [
    { slug: item.slug, lang: "vi" as const },
    { slug: item.slug, lang: "en" as const },
  ]);
}

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export default async function PostDetails({ params }: Props) {
  const { lang, slug } = await params;
  const post = await findPostBySlug({ slug, lang: lang as Lang });

  if (!post) {
    return notFound();
  }

  return (
    <>
      {/* Hero Media */}
      <Media
        resource={post.image}
        imgSize={"large"}
        fClassName={
          "w-full h-full max-h-[40vh] min-h-[40vh] md:min-h-[800px] md:max-h-[60vh]  relative object-cover"
        }
        imgClassName="w-full h-full object-cover"
        fill
      />

      {/* Article */}
      <article className="relative">
        <ArticleTitle
          title={post.title as string}
          description={post.description as string}
          createdAt={post.createdAt as string}
        />

        {/* Share Button - Sticky on desktop */}
        <div className="hidden lg:block fixed top-1/2 right-8 -translate-y-1/2 z-10">
          <Share
            title={post.title as string}
            description={post.description as string}
            slug={post.slug as string}
          />
        </div>

        <div className="container mx-auto py-8 post-content">
          {post.content && (
            <RichText
              data={post.content}
              className="prose md:prose-md lg:prose-2xl mx-auto"
            />
          )}
        </div>

        {/* Share Button - Bottom on mobile */}
        <div className="lg:hidden container mx-auto px-4 pb-8">
          <Share
            title={post.title as string}
            description={post.description as string}
            slug={post.slug as string}
          />
        </div>
      </article>
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const post = await findPostBySlug({
    slug,
    lang: lang as Lang,
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const meta = await generateMeta({ doc: post, lang: lang as Lang });
  return meta;
}