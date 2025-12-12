"use client";
import { Post } from "@/payload-types";
import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
  post: Post;
  variant?: "archive" | "featured";
}

export default function ArticleCard({ post, variant = "archive" }: ArticleCardProps) {
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;

  const featuredImage =
    typeof post.image === "object" && post.image?.url
      ? post.image.url
      : null;

  const publishedDate = post.createdAt
    ? format(new Date(post.createdAt), "dd MMMM yyyy", { locale: dateLocale })
    : null;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block"
    >
      <article className="flex flex-col gap-3 w-full">
        {/* Image */}
        {featuredImage && (
          <div className="relative w-full aspect-16/10 overflow-hidden bg-primary-background">
            <Image
              src={featuredImage}
              alt={post.title || "Article image"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-2 px-1">
          {/* Date */}
          {publishedDate && (
            <time 
              dateTime={post.createdAt}
              className="text-xs text-gray-500 uppercase tracking-wide"
            >
              {publishedDate}
            </time>
          )}

          {/* Title */}
          <h3 className="text-base md:text-lg font-semibold text-[#1f1f1f] line-clamp-2 group-hover:text-[#3569ed] transition-colors duration-300">
            {post.title}
          </h3>

          {/* Description */}
          {post.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {post.description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
