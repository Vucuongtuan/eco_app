import { SearchResultDoc, SearchTagResultDoc } from "@/types";
import { getMediaURL } from "@/utilities/getMediaUrl";
import { parseSearchResultURL } from "@/utilities/search";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { HighlightMatches } from "./HighlightMatches";

interface SearchResultsProps {
  keyword: string;
  isError: boolean;
  isTag?: boolean;
  docs?: (SearchResultDoc | SearchTagResultDoc)[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  keyword,
  isError,
  isTag = false,
  docs,
}) => {
  if (!docs || isError) return null;

  const result = docs.map((item) => {
    const tagDoc = item as SearchTagResultDoc;
    const searchDoc = item as SearchResultDoc;

    const url = parseSearchResultURL(item);
    const thumbnailURL = isTag
      ? getMediaURL(tagDoc.image)
      : searchDoc.thumbnail;

    return (
      <li
        key={`search_result_${item.id}`}
        className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0"
      >
        <div className="relative w-20 h-20 shrink-0 bg-gray-50">
          <Image
            src={thumbnailURL ?? "/assets/thumbnail.svg"}
            alt={item.title ?? ""}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <Link
            href={`${url}?ref=site-search`}
            className="text-sm text-gray-900 hover:text-gray-600 transition-colors duration-200 
                     line-clamp-2 leading-relaxed"
          >
            <HighlightMatches keyword={keyword} text={item.title ?? ""} />
          </Link>
        </div>
      </li>
    );
  });

  return <ul className="divide-y-0">{result}</ul>;
};
