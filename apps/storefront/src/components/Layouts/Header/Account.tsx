"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { CurrentCustomer } from "@/lib/shopify";

type AccountProps = {
    variant?: "icon" | "menu";
    className?: string;
    authenticated?: boolean;
    customer?: CurrentCustomer | null;
};

function AccountIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 sm:size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="3.25" />
            <path strokeLinecap="round" d="M5.75 19c.65-3.25 2.8-5 6.25-5s5.6 1.75 6.25 5" />
        </svg>
    );
}

const iconButtonClass =
    "relative inline-flex min-h-9 items-center justify-center gap-2 rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-black sm:min-h-10";

export default function Account({ variant = "icon", className = "", authenticated = false, customer }: AccountProps) {
    const label = customer?.firstName || customer?.email || (authenticated ? "My account" : "Account");
    const pathname = usePathname();
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    // Đổi trang -> đóng dropdown.
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Click ra ngoài / Escape -> đóng dropdown.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    // Dạng dòng trong drawer mobile.
    if (variant === "menu") {
        return (
            <div className={`space-y-1 ${className}`}>
                <Link href="/account" className="flex items-center gap-3 py-2 font-medium text-gray-900">
                    <AccountIcon />
                    <span className="truncate">{label}</span>
                </Link>
                {authenticated ? (
                    // Dùng <a>, không dùng <Link>, để Next không prefetch route đăng xuất.
                    <a href="/api/customer/logout" className="block py-2 pl-8 text-sm text-gray-600 hover:text-black">
                        Sign out
                    </a>
                ) : null}
            </div>
        );
    }

    // Chưa đăng nhập: link thẳng tới /account.
    if (!authenticated) {
        return (
            <Link href="/account" aria-label="Account" className={`${iconButtonClass} size-9 sm:size-10 ${className}`}>
                <AccountIcon />
            </Link>
        );
    }

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={label}
                className={`${iconButtonClass} px-2 ${className}`}
            >
                <AccountIcon />
                <span className="hidden max-w-28 truncate text-xs font-medium text-gray-900 lg:inline">{label}</span>
                <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-green-500" />
            </button>

            {open ? (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 border border-gray-200 bg-white p-2 shadow-lg">
                    <div className="border-b border-gray-100 px-3 py-2">
                        <p className="truncate text-sm font-medium text-gray-900">{label}</p>
                        {customer?.email ? <p className="mt-1 truncate text-xs text-gray-500">{customer.email}</p> : null}
                    </div>
                    <Link href="/account" role="menuitem" className="mt-1 block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Profile
                    </Link>
                    <a href="/api/customer/logout" role="menuitem" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Sign out
                    </a>
                </div>
            ) : null}
        </div>
    );
}
