"use client";

import { useTranslations } from "next-intl";

export default function ReviewPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const t = useTranslations("review");
  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      <button
        onClick={prev}
        disabled={page <= 1}
        className="px-5 py-2 border border-border rounded-sm text-sm text-text-primary hover:bg-primary-background disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
      >
        {t("pagination.previous")}
      </button>
      
      <div className="px-4 py-2 text-sm text-text-secondary min-w-[80px] text-center">
        {page} / {totalPages}
      </div>
      
      <button
        onClick={next}
        disabled={page >= totalPages}
        className="px-5 py-2 border border-border rounded-sm text-sm text-text-primary hover:bg-primary-background disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
      >
        {t("pagination.next")}
      </button>
    </div>
  );
}
