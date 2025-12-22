"use client";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export const SearchInput: React.FC<{ q: string }> = ({ q = "" }) => {
  const [keyword, setKeyword] = useState(q);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSearchSubmit = () => {
    if (keyword === "" || keyword.length < 4) {
      return setMessage(
        "Từ khóa quá ngắn. Vui lòng nhập ít nhất 3 ký tự để tìm kiếm."
      );
    }
    return router.push(`/search?q=${encodeURIComponent(keyword)}`, {
      scroll: false,
    });
  };

  const handleKeyDownSearchInput = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Enter") return;
    return handleSearchSubmit();
  };

  useEffect(() => {
    if (keyword === "" || keyword.length < 4) return;
    setMessage("");
  }, [keyword]);

  return (
    <div className="w-full py-12 bg-white border-b border-gray-100">
      <div className="container max-w-screen-lg mx-auto px-6">
        <div className="relative max-w-2xl mx-auto">
          <input
            autoComplete="off"
            name="search"
            className="w-full h-12 pl-4 pr-12 text-base bg-transparent border-b-2 border-gray-200
                     focus:outline-none focus:border-gray-900 placeholder:text-gray-400 
                     transition-colors duration-200"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={(e) => setKeyword(e.currentTarget.value)}
            onKeyDown={handleKeyDownSearchInput}
          />
          <button
            aria-label="Submit search"
            onClick={handleSearchSubmit}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center
                     text-gray-400 hover:text-gray-900 transition-colors duration-200"
          >
            <SearchIcon strokeWidth={1.5} className="w-5 h-5" />
          </button>
        </div>
        {message.length > 0 && (
          <p className="mt-4 text-sm text-red-600 text-center">{message}</p>
        )}
      </div>
    </div>
  );
};
