"use client";

import { useAuth } from "@/providers/Auth";
import { findReviewByProduct, replyReview } from "@/service/actions";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import ReviewFilter from "./ReviewFilter";
import ReviewForm from "./ReviewForm";
import ReviewItem from "./ReviewItem";
import ReviewPagination from "./ReviewPagination";

export default function Review({ productId }: { productId: string }) {
  const t = useTranslations("review");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const { user } = useAuth();
  const queryResult = useQuery<any>({
    queryKey: ["reviews", productId, page, limit, ratingFilter, searchText],
    queryFn: () =>
      findReviewByProduct({
        productId,
        limit,
        page,
        rating: ratingFilter ?? undefined,
        q: searchText ?? undefined,
      }),
  });

  const { data, isLoading, refetch } = queryResult as any;

  const d: any = data ?? [];
  const reviews = d.docs ?? [];
  const totalPages =
    (d.totalPages || Math.ceil((d.total || reviews.length) / limit)) ?? 1;
  const handleReply = useCallback(
    async (id: string, text: string) => {
      if (!user?.id) {
        console.error("User must be logged in to reply");
        return;
      }
      
      try {
        await replyReview({productId, userId: user.id, parentId: id, content: text });
        await refetch();
      } catch (e) {
        console.error("Reply failed", e);
      }
    },
    [refetch, user]
  );
  return (
    <section className="max-w-screen-2xl container mx-auto py-12">
      {/* Header - Minimalist */}
      <div className="mb-10">
        <h2 className="text-xl font-normal text-text-primary tracking-wide">{t("title")}</h2>
      </div>

      {/* Form Section - Clean & Simple */}
      <div className="rounded-sm mb-12">
        {user ? (
          <ReviewForm userId={user.id as string} productId={productId} onSuccess={() => refetch()} />
        ) : (
          <div className="bg-primary-light border border-border-light rounded-sm p-5">
            <p className="text-text-secondary text-sm leading-relaxed">
              {t.rich("loginRequired", {
                span: (chunks: any) => <span className="font-normal">{chunks}</span>
              })}
            </p>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <ReviewFilter
        rating={ratingFilter}
        onChangeRating={(r) => {
          setRatingFilter(r);
          setPage(1);
        }}
        search={searchText}
        onSearchChange={(v) => {
          setSearchText(v);
          setPage(1);
        }}
      />

      {/* Reviews List - Minimalist spacing */}
      <div className="space-y-6 mt-8">
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm">{t("loading")}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-primary-background rounded-sm">
            <p className="text-text-muted text-sm">{t("noReviews")}</p>
          </div>
        ) : (
          reviews &&
          reviews.length > 0 &&
          reviews.map((rev: any) => (
            <ReviewItem
              key={rev.id ?? rev._id}
              review={rev}
              onReply={handleReply}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <ReviewPagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </section>
  );
}
