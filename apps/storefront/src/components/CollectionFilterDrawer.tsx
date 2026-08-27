"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Drawer } from "@/components/common";
import type { Filter } from "@/lib/shopify/types";

type CollectionFilterDrawerProps = {
  filters: Filter[];
};

const SORT_OPTIONS = [
  { label: "Featured", value: "COLLECTION_DEFAULT", reverse: false },
  { label: "Best Selling", value: "BEST_SELLING", reverse: false },
  { label: "Alphabetically, A-Z", value: "TITLE", reverse: false },
  { label: "Alphabetically, Z-A", value: "TITLE", reverse: true },
  { label: "Price, low to high", value: "PRICE", reverse: false },
  { label: "Price, high to low", value: "PRICE", reverse: true },
  { label: "Date, new to old", value: "CREATED", reverse: true },
];

export function CollectionFilterDrawer({ filters }: CollectionFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local draft state for filters and sorting before submitting
  const [draftSortKey, setDraftSortKey] = useState<string>("COLLECTION_DEFAULT");
  const [draftReverse, setDraftReverse] = useState<boolean>(false);
  const [draftSelectedFilters, setDraftSelectedFilters] = useState<Record<string, string[]>>({});
  const [draftPriceMin, setDraftPriceMin] = useState<string>("");
  const [draftPriceMax, setDraftPriceMax] = useState<string>("");

  // Sync draft state from URL when Drawer opens
  useEffect(() => {
    if (isOpen) {
      setDraftSortKey(searchParams.get("sortKey") || "COLLECTION_DEFAULT");
      setDraftReverse(searchParams.get("reverse") === "true");
      setDraftPriceMin(searchParams.get("price_min") || "");
      setDraftPriceMax(searchParams.get("price_max") || "");

      const activeFilters: Record<string, string[]> = {};
      searchParams.forEach((val, key) => {
        if (key !== "sortKey" && key !== "reverse" && key !== "price_min" && key !== "price_max") {
          activeFilters[key] = val.split(",");
        }
      });
      setDraftSelectedFilters(activeFilters);
    }
  }, [isOpen, searchParams]);

  // Count active applied filters from URL
  let activeFilterCount = 0;
  searchParams.forEach((val, key) => {
    if (key !== "sortKey" && key !== "reverse") {
      activeFilterCount += val.split(",").length;
    }
  });

  const handleFilterToggle = (filterId: string, inputStr: string) => {
    setDraftSelectedFilters((prev) => {
      const existing = prev[filterId] || [];
      const updated = existing.includes(inputStr)
        ? existing.filter((v) => v !== inputStr)
        : [...existing, inputStr];
      return { ...prev, [filterId]: updated };
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    // Sort
    if (draftSortKey !== "COLLECTION_DEFAULT") {
      params.set("sortKey", draftSortKey);
      if (draftReverse) params.set("reverse", "true");
    }

    // Price
    if (draftPriceMin) params.set("price_min", draftPriceMin);
    if (draftPriceMax) params.set("price_max", draftPriceMax);

    // Filters
    Object.entries(draftSelectedFilters).forEach(([filterId, values]) => {
      const validValues = values.filter(Boolean);
      if (validValues.length > 0) {
        params.set(filterId, validValues.join(","));
      }
    });

    setIsOpen(false);
    // Push params to URL and trigger page refresh with new filter params
    window.location.href = `${pathname}?${params.toString()}`;
  };

  const clearAllFilters = () => {
    setDraftSelectedFilters({});
    setDraftPriceMin("");
    setDraftPriceMax("");
    setDraftSortKey("COLLECTION_DEFAULT");
    setDraftReverse(false);
    
    setIsOpen(false);
    window.location.href = pathname;
  };

  return (
    <>
      {/* Trigger button rendered right below full width border line */}
      <div className="flex items-center justify-between py-4 px-5 sm:px-6 lg:px-12">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 text-sm uppercase tracking-wider font-medium text-gray-900 hover:text-gray-600 transition-colors"
        >
          <svg
            className="size-4 text-gray-700 group-hover:text-gray-900 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-9.75 0h9.75"
            />
          </svg>
          <span>Filter & Sort</span>
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-gray-500 underline underline-offset-4 hover:text-black"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Slide-over Drawer Component */}
      <Drawer open={isOpen} onClose={() => setIsOpen(false)} title="Filter & Sort">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          className="flex flex-col h-full justify-between"
        >
          <div className="p-5 space-y-8 divide-y divide-gray-100">
            {/* SORT SECTION */}
            <div className="pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">
                Sort By
              </h3>
              <div className="space-y-2.5">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected =
                    draftSortKey === opt.value && draftReverse === opt.reverse;
                  return (
                    <label
                      key={`${opt.value}-${opt.reverse}`}
                      className="flex items-center gap-3 cursor-pointer text-sm text-gray-700 hover:text-black"
                    >
                      <input
                        type="radio"
                        name="sort_option"
                        checked={isSelected}
                        onChange={() => {
                          setDraftSortKey(opt.value);
                          setDraftReverse(opt.reverse);
                        }}
                        className="size-4 accent-black"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC FILTERS FROM SHOPIFY */}
            {filters.map((filter) => {
              const activeValues = draftSelectedFilters[filter.id] || [];

              if (filter.type === "PRICE_RANGE") {
                return (
                  <div key={filter.id} className="pt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">
                      {filter.label}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          placeholder="From"
                          value={draftPriceMin}
                          onChange={(e) => setDraftPriceMin(e.target.value)}
                          className="w-full border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-black focus:outline-none"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          placeholder="To"
                          value={draftPriceMax}
                          onChange={(e) => setDraftPriceMax(e.target.value)}
                          className="w-full border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={filter.id} className="pt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">
                    {filter.label}
                  </h3>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {filter.values.map((val) => {
                      const isChecked = activeValues.includes(val.input);
                      return (
                        <label
                          key={val.id}
                          className="flex items-center justify-between cursor-pointer text-sm text-gray-700 hover:text-black"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleFilterToggle(filter.id, val.input)}
                              className="size-4 accent-black rounded"
                            />
                            <span>{val.label}</span>
                          </div>
                          <span className="text-xs text-gray-400">({val.count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DRAWER FOOTER */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white p-5 flex gap-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 border border-gray-300 py-3 text-xs uppercase tracking-wider font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear ({activeFilterCount})
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-black py-3 text-xs uppercase tracking-wider font-medium text-white hover:bg-gray-800 transition-colors"
            >
              View Results
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
