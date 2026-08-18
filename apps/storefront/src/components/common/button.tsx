"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "border-primary bg-primary text-primary-foreground hover:border-[#2b2b2b] hover:bg-[#2b2b2b]",
  secondary: "border-subtle bg-subtle text-foreground hover:border-border hover:bg-[#eeeeee]",
  outline: "border-border bg-background text-foreground hover:bg-subtle",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-subtle",
  danger: "border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700",
} as const;

const sizes = {
  sm: "min-h-8 gap-1.5 px-3 text-sm",
  md: "min-h-10 gap-2 px-4 text-sm",
  lg: "min-h-12 gap-2.5 px-5 text-base",
  icon: "size-10 p-0",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  loading?: boolean;
};

function LoadingIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    iconBefore,
    iconAfter,
    loading = false,
    size = "md",
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-slot="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-button border font-medium whitespace-nowrap",
        "transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <LoadingIcon /> : iconBefore}
      {children}
      {!loading && iconAfter}
    </button>
  );
});

