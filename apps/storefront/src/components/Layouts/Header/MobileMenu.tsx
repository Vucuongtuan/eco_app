"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/shopify/types";
import type { CurrentCustomer } from "@/lib/shopify";
import Account from "./Account";
import { normalizeMenuUrl } from "./menu-utils";

type MobileMenuProps = {
    nav: MenuItem[];
    authenticated?: boolean;
    customer?: CurrentCustomer | null;
    className?: string;
};

function ItemLink({ item, className }: { item: MenuItem; className: string }) {
    return item.url ? (
        <Link href={normalizeMenuUrl(item.url)} className={className}>
            {item.title}
        </Link>
    ) : (
        <span className={className}>{item.title}</span>
    );
}

/** Menu mobile: drawer bên trái, accordion theo từng mục cha. Chỉ hiển thị dưới breakpoint md. */
export default function MobileMenu({ nav, authenticated = false, customer, className = "" }: MobileMenuProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Đổi trang -> đóng drawer.
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Khi mở: khóa scroll nền + đóng bằng Escape.
    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div className={`col-start-1 row-start-1 justify-self-start md:hidden ${className}`}>
            <button
                type="button"
                aria-label="Open menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className="inline-flex size-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
            >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
            </button>

            {open &&
                createPortal(
                    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

                        <aside className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-xl motion-safe:animate-[menu-drawer-in_240ms_cubic-bezier(0.22,1,0.36,1)]">
                            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-4">
                                <span className="text-sm font-semibold text-gray-900">Menu</span>
                                <button
                                    type="button"
                                    aria-label="Close menu"
                                    onClick={() => setOpen(false)}
                                    className="inline-flex size-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
                                >
                                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                                    </svg>
                                </button>
                            </div>

                            <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto overscroll-contain px-4">
                                <ul className="divide-y divide-gray-100">
                                    {nav.map((item) => {
                                        const hasChildren = Boolean(item.items?.length);
                                        const isExpanded = expandedId === item.id;
                                        const panelId = `mobile-menu-${item.id}`;

                                        return (
                                            <li key={item.id}>
                                                <div className="flex items-center justify-between">
                                                    <ItemLink item={item} className="flex-1 py-4 text-base font-semibold text-gray-900" />
                                                    {hasChildren && (
                                                        <button
                                                            type="button"
                                                            aria-expanded={isExpanded}
                                                            aria-controls={panelId}
                                                            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.title}`}
                                                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                                            className="inline-flex size-11 items-center justify-center text-gray-500"
                                                        >
                                                            <svg
                                                                aria-hidden="true"
                                                                viewBox="0 0 24 24"
                                                                className={`size-5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>

                                                {hasChildren && isExpanded && (
                                                    <ul id={panelId} className="space-y-1 pb-4 pl-2">
                                                        {item.url && (
                                                            <li>
                                                                <Link
                                                                    href={normalizeMenuUrl(item.url)}
                                                                    className="block py-2 text-sm font-medium text-gray-900 underline underline-offset-4"
                                                                >
                                                                    View all {item.title}
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {item.items!.map((child) => (
                                                            <li key={child.id}>
                                                                <ItemLink item={child} className="block py-2 text-sm font-medium text-gray-800" />
                                                                {child.items?.length ? (
                                                                    <ul className="ml-1 border-l border-gray-200 pl-3">
                                                                        {child.items.map((grandchild) => (
                                                                            <li key={grandchild.id}>
                                                                                <ItemLink item={grandchild} className="block py-1.5 text-sm text-gray-500 hover:text-black" />
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : null}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>

                            <div className="shrink-0 border-t border-gray-100 p-4">
                                <Account variant="menu" authenticated={authenticated} customer={customer} />
                            </div>
                        </aside>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
