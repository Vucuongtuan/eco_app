"use client";

import Link from "next/link";
import { useState } from "react";

type AccountProps = {
    variant?: "icon" | "menu";
    className?: string;
};

function AccountIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 sm:size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="3.25" />
            <path strokeLinecap="round" d="M5.75 19c.65-3.25 2.8-5 6.25-5s5.6 1.75 6.25 5" />
        </svg>
    );
}

export default function Account({ variant = "icon", className = "", authenticated = false, customer }: AccountProps & { authenticated?: boolean; customer?: { email: string | null; firstName: string | null } | null }) {
    const label = customer?.firstName || customer?.email || (authenticated ? "My account" : "Account");
    const [open, setOpen] = useState(false);
    if (variant === "menu") {
        return (
            <Link href="/account" className={`flex items-center gap-3 font-medium text-gray-900 ${className}`}>
                <AccountIcon />
                <span>{label}</span>
            </Link>
        );
    }

    return (
        <div className="relative">
            <button type="button" onClick={() => authenticated ? setOpen((value) => !value) : undefined} aria-expanded={authenticated ? open : undefined} aria-label={label} className={`relative inline-flex min-h-9 items-center justify-center gap-2 rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-black sm:min-h-10 ${authenticated ? "px-2" : "size-9 sm:size-10"} ${className}`}>
                <AccountIcon />
                {authenticated ? <span className="hidden max-w-28 truncate text-xs font-medium text-gray-900 lg:inline">{label}</span> : null}
                {authenticated ? <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-green-500" /> : null}
            </button>
            {!authenticated ? <Link href="/account" className="absolute inset-0" aria-label="Account" /> : null}
            {authenticated && open ? <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-gray-200 bg-white p-2 shadow-lg">
                <div className="border-b border-gray-100 px-3 py-2"><p className="text-sm font-medium text-gray-900">{label}</p><p className="mt-1 truncate text-xs text-gray-500">{customer?.email}</p></div>
                <Link href="/account" onClick={() => setOpen(false)} className="mt-1 block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                <Link href="/api/customer/logout" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign out</Link>
            </div> : null}
        </div>
    );
}
