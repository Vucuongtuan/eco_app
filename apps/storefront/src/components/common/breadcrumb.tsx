import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

export type BreadcrumbProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  items: readonly BreadcrumbItem[];
  separator?: ReactNode;
};

export function Breadcrumb({ items, separator = "/", className, ...props }: BreadcrumbProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-gray-500", className)} {...props}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const content = isCurrent ? (
            <span aria-current="page" className="truncate text-gray-900">
              {item.label}
            </span>
          ) : item.href ? (
            <Link href={item.href} className="truncate transition-colors hover:text-gray-900">
              {item.label}
            </Link>
          ) : (
            <span className="truncate">{item.label}</span>
          );

          return (
            <li key={`${index}-${String(item.label)}`} className="flex min-w-0 items-center gap-x-2">
              {index > 0 ? (
                <span aria-hidden="true" className="select-none text-gray-400">
                  {separator}
                </span>
              ) : null}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
