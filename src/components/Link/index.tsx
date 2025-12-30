import type { Category, Page, Product } from "@/payload-types";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/utilities/cn";
import Link from "next/link";
import React from "react";

type CMSLinkType = {
  appearance?: "inline" | ButtonProps["variant"];
  children?: React.ReactNode;
  className?: string;
  label?: string | null;
  newTab?: boolean | null;
  reference?: {
    relationTo: "pages" | "categories" | "products";
    value: Page | Category | Product | string | number;
  } | null;
  size?: ButtonProps["size"] | null;
  type?: "custom" | "reference" | null;
  url?: string | null;
  isLink?: boolean;
};

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
    isLink = false,
  } = props;

  const href =
    type === "reference" &&
    typeof reference?.value === "object" &&
    reference.value.slug
      ? `${reference?.relationTo !== "pages" ? `/${reference?.relationTo}` : ""}/${
          reference.value.slug
        }`
      : url;

  if (!href) return null;

  const newTabProps = newTab
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};

  if (isLink) {
    return (
      <Link className={cn(className)} href={href} {...newTabProps}>
        {children && children}
      </Link>
    );
  }

  return (
    <Button asChild className={className}>
      <Link className={cn(className)} href={href} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  );
};
