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
    <section className="max-w-screen-2xl container mx-auto py-8">
      <header className="mb-4">
        <h2 className="text-lg font-medium">{t("title")} - {user?.email}</h2>
      </header>

      {/* Show form only if user is logged in */}
      {user ? (
        <ReviewForm userId={user.id as string} productId={productId} onSuccess={() => refetch()} />
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            {t.rich("loginRequired", {
              span: (chunks: any) => <span className="font-medium">{chunks}</span>
            })}
          </p>
        </div>
      )}

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

      <div>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
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

      <ReviewPagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </section>
  );
}
