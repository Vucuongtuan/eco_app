"use client";

import { Product } from "@/payload-types";
import { useCallback, useMemo, useState } from "react";
import {
    applyFilters,
    DEFAULT_FILTERS,
    extractFilterOptions,
    FilterOptions,
} from "../utils/filterHelpers";

interface UseProductFiltersProps {
  products: Product[];
}

export function useProductFilters({ products }: UseProductFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  // Extract available filter options from products
  const filterOptions = useMemo(
    () => extractFilterOptions(products),
    [products]
  );

  // Apply filters to products
  const filteredProducts = useMemo(
    () => applyFilters(products, filters),
    [products, filters]
  );

  // Update sort
  const setSort = useCallback((sort: string | null) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  // Update price range
  const setPriceRange = useCallback(
    (range: { min: number; max: number } | null) => {
      setFilters((prev) => ({ ...prev, priceRange: range }));
    },
    []
  );

  // Toggle color
  const toggleColor = useCallback((color: string) => {
    setFilters((prev) => {
      const newColors = prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors: newColors };
    });
  }, []);

  // Toggle tag
  const toggleTag = useCallback((tagId: string) => {
    setFilters((prev) => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId];
      return { ...prev, tags: newTags };
    });
  }, []);

  // Toggle size
  const toggleSize = useCallback((size: string) => {
    setFilters((prev) => {
      const newSizes = prev.size.includes(size)
        ? prev.size.filter((s) => s !== size)
        : [...prev.size, size];
      return { ...prev, size: newSizes };
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.sort !== null ||
      filters.priceRange !== null ||
      filters.colors.length > 0 ||
      filters.tags.length > 0 ||
      filters.size.length > 0
    );
  }, [filters]);

  return {
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
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
  };
}
