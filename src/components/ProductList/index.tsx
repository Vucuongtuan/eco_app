"use client";

import { Product } from "@/payload-types";
import { Lang, ResponseDocs } from "@/types";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ProductFilterDrawer } from "../ProductFilter";
import { useProductFilters } from "../ProductFilter/hooks/useProductFilters";
import { ProductCard } from "./ProductCard";
import Skeleton from "./Skeleton";
import { useInfiniteProduct } from "./hooks/useInfiniteProduct";

interface ProductListProps {
  initData: ResponseDocs<Product>;
  categoryId: string;
  lang: Lang;
}

export default function ProductList(props: ProductListProps) {
  const { initData, categoryId, lang } = props;
  const t = useTranslations("productFilter");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { data, isFetchingNextPage, ref } = useInfiniteProduct({
    initData,
    categoryId,
    lang,
  });

  const allProducts = useMemo(
    () => data?.pages.flatMap((page) => page.docs) || [],
    [data]
  );

  // Use product filters hook
  const {
    filters,
    filterOptions,
    filteredProducts,
    setSort,
    setPriceRange,
    toggleColor,
    toggleTag,
    toggleSize,
    clearFilters,
    hasActiveFilters,
    filteredCount,
  } = useProductFilters({ products: allProducts });

  return (
    <>
      {/* Filter Button */}
      <div className="max-w-screen-3xl mx-auto px-16 py-4 flex items-center justify-between border-b">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer  transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span className="text-sm font-medium">{t("filterButton")}</span>
        </button>
      </div>

      {/* Filter Drawer */}
      <ProductFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        filterOptions={filterOptions}
        onSortChange={setSort}
        onPriceRangeChange={setPriceRange}
        onToggleColor={toggleColor}
        onToggleTag={toggleTag}
        onToggleSize={toggleSize}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredCount}
      />

      {/* Product Grid */}
      <section className="w-full h-auto py-12">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-1 gap-y-4 w-full">
          {filteredProducts.map((doc) => (
            <li key={doc.id} className="aspect-card">
              <ProductCard doc={doc} lang={lang} />
            </li>
          ))}
          {isFetchingNextPage && (
            <Skeleton
              numberItems={4}
              className="rounded-lg"
              options={{
                isImage: {
                  height: "h-[200px] lg:h-[300px]",
                  width: "w-full",
                },
                isTitle: {
                  height: "h-[20px]",
                  width: "w-full",
                },
                isDescription: {
                  height: "h-[16px]",
                  width: "w-[60%]",
                },
                gap: "gap-2",
              }}
            />
          )}
        </ul>
        <div ref={ref} />
      </section>
    </>
  );
}
