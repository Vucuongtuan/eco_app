"use client";

import { searchByKeywordOrTag } from "@/service/actions";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { SearchResults } from "./SearchResults";

interface Props {
  initKeyword?: string;
}

export const FlashSearch: React.FC<Props> = ({ initKeyword = "" }) => {
  const [query, setQuery] = useState(initKeyword);
  const debouncedQuery = useDebounce(query, 500);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["fast-search", debouncedQuery],
    queryFn: () => searchByKeywordOrTag(debouncedQuery),
    enabled: !!debouncedQuery,
    staleTime: Infinity,
  });

  const handleKeyDownSearchInput = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Search Input Field */}
      <div className="w-full px-6 lg:px-8 pt-8 pb-6 border-b border-gray-100">
        <div className="relative max-w-3xl mx-auto">
          <input
            autoComplete="off"
            name="search"
            ref={inputRef}
            className="w-full h-12 pl-4 pr-12 text-base bg-transparent border-b-2 border-gray-200
                     focus:outline-none focus:border-gray-900 placeholder:text-gray-400 
                     transition-colors duration-200"
            placeholder="Tìm kiếm sản phẩm..."
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownSearchInput}
            value={query}
          />
          <SearchIcon
            strokeWidth={1.5}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Search Status Header */}
      {debouncedQuery && (
        <div className="px-6 lg:px-8 py-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-600">
              {isLoading
                ? `Đang tìm kiếm "${debouncedQuery}"...`
                : data && data.totalDocs > 0
                  ? `${data.totalDocs} kết quả`
                  : `Không tìm thấy kết quả`}
            </p>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <SearchResults
            keyword={debouncedQuery}
            docs={data?.docs}
            isError={isError}
          />
        </div>
      </div>

      {/* View All Results Footer */}
      {data && data.hasNextPage && (
        <div className="border-t border-gray-100 px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <Link
              href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
              className="block text-center py-3 text-sm font-medium text-gray-900 
                       hover:text-gray-600 transition-colors duration-200 underline underline-offset-4"
            >
              Xem tất cả kết quả →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
