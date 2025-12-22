"use client";

import { SearchIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FlashSearch } from "./FlashSearch";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Lưu scrollbar width trước khi ẩn
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Ẩn scroll và thêm padding để tránh content shift
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content - Desktop: centered, Mobile: full screen */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center md:pt-16 overflow-hidden">
        <div
          className="relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-4xl 
                   bg-white md:border md:border-gray-200
                   flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center
                     text-gray-400 hover:text-gray-900 transition-colors duration-200"
            aria-label="Đóng tìm kiếm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Search Content */}
          <div className="flex-1 overflow-hidden">
            <FlashSearch />
          </div>
        </div>
      </div>
    </>
  );
};

export const SearchButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-9 h-9 flex items-center justify-center 
                 text-gray-700 hover:text-gray-900 transition-colors duration-200"
        aria-label="Mở tìm kiếm"
      >
        <SearchIcon className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
