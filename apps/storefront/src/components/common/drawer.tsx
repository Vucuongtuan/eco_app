"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  className?: string;
};

export function Drawer({ open, onClose, children, title, className }: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setActive(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setActive(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted || (!open && !active)) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70]" aria-hidden={false}>
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-default bg-black/40 transition-opacity duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Drawer"}
        className={cn(
          "absolute inset-y-0 right-0 z-10 flex w-[25vw] min-w-[22rem] max-w-[32rem] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out max-md:w-[88vw] max-md:min-w-0",
          visible ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-medium">{title}</h2>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              aria-label="Close drawer"
              className="text-2xl leading-none text-gray-500 hover:text-black"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>,
    document.body
  );
}
