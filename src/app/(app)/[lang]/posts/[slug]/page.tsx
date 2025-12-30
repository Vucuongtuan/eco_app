import Article from "@/components/Article/Article";
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
      <Article post={post} />
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
