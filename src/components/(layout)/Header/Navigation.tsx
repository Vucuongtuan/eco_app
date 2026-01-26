"use client";

import { Header } from "@/payload-types";
import { Lang } from "@/types";
import { resolveLink, resolveTitle } from "@/utilities/getLinkAndTitle";
import { useLocale } from "next-intl";
import Link from "next/link";
import { memo } from "react";

interface NavigationProps {
  navData: Header["navItems"];
  onMenuItemHover: (itemId: string) => void;
}

export const Navigation = memo(function Navigation({
  navData,
  onMenuItemHover,
}: Omit<NavigationProps, "onMenuLeave">) {
  const locale = useLocale();
  return (
    <nav className="flex-1 hidden md:flex md:items-center md:space-x-8">
      {navData?.map((link) => {
        if (!link) return null;
        const hasChildren = link.child && link.child?.length > 0;

        return (
          <Link
            key={link.id}
            href={resolveLink(link, locale as Lang)}
            className={`text-sm lg:text-base font-medium transition-colors duration-200 hover:text-gray-600 ${
              hasChildren ? "cursor-pointer" : ""
            }`}
            onMouseEnter={() => onMenuItemHover(link.id as string)}
          >
            {resolveTitle(link)}
            {hasChildren && (
              <svg
                className="inline-block ml-1 w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </Link>
        );
      })}
    </nav>
  );
});
