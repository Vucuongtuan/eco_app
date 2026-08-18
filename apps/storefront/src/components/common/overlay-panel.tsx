import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type OverlayPanelProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  contentClassName?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onAnimationEnd?: () => void;
};

export function OverlayPanel({
  children,
  id,
  className,
  contentClassName,
  onMouseEnter,
  onMouseLeave,
  onAnimationEnd,
}: OverlayPanelProps) {
  return (
    <div
      id={id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onAnimationEnd={onAnimationEnd}
      className={cn(
        "fixed inset-x-0 top-16 z-40 border-b border-gray-200 bg-white px-5 py-4 shadow-lg",
        "motion-safe:animate-[mobile-menu-in_180ms_ease-out] sm:px-6 md:px-8 md:py-6",
        className,
      )}
    >
      <div className={cn("mx-auto w-full px-6", contentClassName)}>{children}</div>
    </div>
  );
}
