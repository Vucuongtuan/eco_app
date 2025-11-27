"use client";

import { cn } from "@/lib/utils";
import { Tag } from "@/payload-types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FilterOptions } from "./utils/filterHelpers";

interface ProductFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  filterOptions: {
    priceRanges: Array<{ label: string; min: number; max: number }>;
    sizes: string[];
    colors: string[];
    tags: Tag[];
  };
  onSortChange: (sort: string | null) => void;
  onPriceRangeChange: (range: { min: number; max: number } | null) => void;
  onToggleColor: (color: string) => void;
  onToggleTag: (tagId: string) => void;
  onToggleSize: (size: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount: number;
}

export function ProductFilterDrawer({
  isOpen,
  onClose,
  filters,
  filterOptions,
  onSortChange,
  onPriceRangeChange,
  onToggleColor,
  onToggleTag,
  onToggleSize,
  onClearFilters,
  hasActiveFilters,
  filteredCount,
}: ProductFilterDrawerProps) {
  const t = useTranslations("productFilter");
  const [tagSearch, setTagSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    size: true,
    color: true,
    tags: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter tags based on search
  const filteredTags = tagSearch
    ? filterOptions.tags.filter((tag) =>
        tag.title?.toLowerCase().includes(tagSearch.toLowerCase())
      )
    : filterOptions.tags;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-medium">{t("title")}</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SORT BY */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium uppercase tracking-wide">
              {t("sort.label")}
            </h3>
            <div className="space-y-2">
              {[
                { value: "", label: t("sort.bestSelling") },
                { value: "newest", label: t("sort.newest") },
                { value: "priceLowHigh", label: t("sort.priceLowHigh") },
                { value: "priceHighLow", label: t("sort.priceHighLow") },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="sort"
                    checked={filters.sort === (option.value || null)}
                    onChange={() => onSortChange(option.value || null)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm group-hover:underline">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div className="border-t pt-6">
            <button
              onClick={() => toggleSection("price")}
              className="flex items-center justify-between w-full text-sm font-medium uppercase tracking-wide"
            >
              {t("priceRange.label")}
              <span className="text-xl">{expandedSections.price ? "−" : "+"}</span>
            </button>
            {expandedSections.price && (
              <div className="mt-3 space-y-2">
                {filterOptions.priceRanges.map((range) => {
                  const isSelected =
                    filters.priceRange?.min === range.min &&
                    filters.priceRange?.max === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() =>
                        onPriceRangeChange(
                          isSelected ? null : { min: range.min, max: range.max }
                        )
                      }
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded transition-colors",
                        isSelected
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      )}
                    >
                      {t(`priceRange.${range.label}`)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIZE */}
          {filterOptions.sizes.length > 0 && (
            <div className="border-t pt-6">
              <button
                onClick={() => toggleSection("size")}
                className="flex items-center justify-between w-full text-sm font-medium uppercase tracking-wide"
              >
                {t("size.label")}
                <span className="text-xl">{expandedSections.size ? "−" : "+"}</span>
              </button>
              {expandedSections.size && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {filterOptions.sizes.map((size) => {
                    const isSelected = filters.size.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => onToggleSize(size)}
                        className={cn(
                          "px-4 py-2 text-sm border rounded transition-colors",
                          isSelected
                            ? "bg-black text-white border-black"
                            : "border-gray-300 hover:border-black"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* COLOR */}
          {filterOptions.colors.length > 0 && (
            <div className="border-t pt-6">
              <button
                onClick={() => toggleSection("color")}
                className="flex items-center justify-between w-full text-sm font-medium uppercase tracking-wide"
              >
                {t("color.label")}
                <span className="text-xl">{expandedSections.color ? "−" : "+"}</span>
              </button>
              {expandedSections.color && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {filterOptions.colors.map((color) => {
                    const isSelected = filters.colors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => onToggleColor(color)}
                        className={cn(
                          "px-4 py-2 text-sm border rounded transition-colors",
                          isSelected
                            ? "bg-black text-white border-black"
                            : "border-gray-300 hover:border-black"
                        )}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAGS */}
          {filterOptions.tags.length > 0 && (
            <div className="border-t pt-6">
              <button
                onClick={() => toggleSection("tags")}
                className="flex items-center justify-between w-full text-sm font-medium uppercase tracking-wide"
              >
                {t("tags.label")}
                <span className="text-xl">{expandedSections.tags ? "−" : "+"}</span>
              </button>
              {expandedSections.tags && (
                <div className="mt-3 space-y-3">
                  {/* Search input */}
                  <input
                    type="text"
                    placeholder={t("tags.searchPlaceholder")}
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
                  />
                  {/* Tag list */}
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredTags.map((tag) => {
                      const isSelected = filters.tags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => onToggleTag(tag.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded transition-colors",
                            isSelected
                              ? "bg-black text-white"
                              : "hover:bg-gray-100"
                          )}
                        >
                          {tag.title}
                        </button>
                      );
                    })}
                    {filteredTags.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        {t("tags.noResults")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 space-y-3">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full py-3 border border-gray-300 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              {t("clearAll")}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-black text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {t("viewProducts", { count: filteredCount })}
          </button>
        </div>
      </div>
    </>
  );
}
