"use client";

import { useTranslations } from "next-intl";

export default function ReviewFilter({
  rating,
  onChangeRating,
  search,
  onSearchChange,
}: {
  rating: number | null;
  onChangeRating: (r: number | null) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const t = useTranslations("review");
  
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {/* Search Input - Minimalist */}
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t("filter.searchPlaceholder")}
        className="flex-1 px-4 py-2.5 bg-white border border-border rounded-sm text-sm text-text-primary placeholder:text-text-muted focus:border-text-secondary focus:outline-none transition-colors"
      />

      {/* Rating Filter - Simple */}
      <select
        value={rating ?? ""}
        onChange={(e) =>
          onChangeRating(e.target.value ? Number(e.target.value) : null)
        }
        className="px-4 py-2.5 bg-white border border-border rounded-sm text-sm text-text-primary focus:border-text-secondary focus:outline-none transition-colors cursor-pointer min-w-[140px]"
      >
        <option value="">{t("filter.allRatings")}</option>
        <option value="5">{t("filter.5stars")}</option>
        <option value="4">{t("filter.4starsPlus")}</option>
        <option value="3">{t("filter.3starsPlus")}</option>
        <option value="2">{t("filter.2starsPlus")}</option>
        <option value="1">{t("filter.1starPlus")}</option>
      </select>
    </div>
  );
}
