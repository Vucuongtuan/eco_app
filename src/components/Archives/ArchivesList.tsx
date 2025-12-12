"use client";
import { Post } from "@/payload-types";
import { findLatestPostByLang } from "@/service/actions";
import { Lang } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { get } from "lodash";
import { useTranslations } from "next-intl";
import { PaginatedDocs } from "payload";
import { useEffect, useRef } from "react";
import ArticleCard from "./ArticleCard";

export default function ArchivesList({
  initData,
  lang,
}: {
  initData: PaginatedDocs<Post>;
  lang: Lang;
}) {
  const t = useTranslations("posts");
  const [ref, entry] = useIntersectionObserver({
    root: null,
    rootMargin: "0px 0px 300px 0px",
    threshold: 0.5,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
    PaginatedDocs<Post>,
    Error
  >({
    getNextPageParam: (lastPage) => get(lastPage, "nextPage"),
    initialData: {
      pageParams: [1],
      pages: [initData],
    },
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      return findLatestPostByLang(lang, pageParam as number);
    },
    queryKey: ["archives", lang],
    staleTime: Infinity,
  });

  const loadingLock = useRef<boolean>(false);
  const fetchCount = useRef<number>(1);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (
      entry?.isIntersecting &&
      hasNextPage &&
      !isFetchingNextPage &&
      !loadingLock.current &&
      fetchCount.current < 3
    ) {
      loadingLock.current = true;

      fetchNextPage().finally(() => {
        fetchCount.current += 1;
        timeout = setTimeout(() => {
          loadingLock.current = false;
        }, 300);
      });
    }

    return () => clearTimeout(timeout);
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const articles = data?.pages.flatMap((page) =>
    page.docs.map((post, index) => (
      <li key={`archive_${index}_${post.id}`}>
        <ArticleCard post={post} variant="archive" />
      </li>
    )),
  );

  return (
    <section className="max-w-screen-3xl container mx-auto px-4 md:px-8 lg:px-16 py-8">
      {/* Grid Layout */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {articles}
      </ul>

      {/* Loading Indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#3569ed] rounded-full animate-spin" />
            <p className="text-sm text-gray-500">{t("loading")}</p>
          </div>
        </div>
      )}

      {/* Intersection Observer Trigger */}
      {hasNextPage && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* End Message */}
      {!hasNextPage && articles && articles.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">{t("noMorePosts")}</p>
        </div>
      )}
    </section>
  );
}