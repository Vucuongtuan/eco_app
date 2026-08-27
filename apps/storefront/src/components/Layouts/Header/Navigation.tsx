"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { MenuItem } from "@/lib/shopify/types";
import Link from "next/link";
import Account from "./Account";
import { OverlayPanel } from "@/components/common";
import { WishlistButton } from "@/components/WishlistButton";
import type { CurrentCustomer } from "@/lib/shopify";

type NavigationProps = {
    nav: MenuItem[];
    className?: string;
    collectionImages?: Record<string, string>;
    authenticated?: boolean;
    customer?: CurrentCustomer | null;
};

function normalizeMenuUrl(value: string) {
    try {
        const url = new URL(value, "https://local.moon-co.test");
        if (url.hostname.endsWith(".myshopify.com") || url.hostname.endsWith(".shopify.com")) {
            return `${url.pathname}${url.search}${url.hash}`;
        }
    } catch {
        return value;
    }
    return value;
}

export default function Navigation ({ nav, className = "", collectionImages = {}, authenticated = false, customer }: NavigationProps) {
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeItem = nav.find((item) => item.id === activeItemId);
    const newInItem = activeItem?.items?.find((item) =>
        item.title.trim().toLowerCase() === "new in"
    );
    const newInHandle = newInItem?.url && normalizeMenuUrl(newInItem.url).match(/\/collections\/([^/?#]+)/)?.[1];
    const newInImage = newInHandle ? collectionImages[newInHandle] : undefined;

    function keepPanelOpen() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }

    function closePanelSoon() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setActiveItemId(null), 180);
    }

    return (
        <div
            className={className}
        >
            <nav aria-label="Primary navigation" className="hidden md:block">
                <ul className="flex items-center justify-center gap-5 lg:gap-7">
                    {nav.map((item) => (
                        <li
                            key={item.id}
                            onMouseEnter={() => {
                                keepPanelOpen();
                                setActiveItemId(item.items?.length ? item.id : null);
                            }}
                            onFocus={() => setActiveItemId(item.items?.length ? item.id : null)}
                        >
                            {item.url ? (
                                <Link
                                    href={normalizeMenuUrl(item.url)}
                                    className="relative inline-block py-1 text-[0.8rem] font-medium text-gray-600 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:text-black hover:after:scale-x-100 focus-visible:text-black focus-visible:after:scale-x-100 lg:text-[0.85rem]"
                                >
                                    {item.title}
                                </Link>
                            ) : (
                                <span className="text-[0.8rem] font-medium text-gray-600 lg:text-[0.85rem]">
                                    {item.title}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {activeItem?.items?.length ? (
                <OverlayPanel
                    className="hidden md:block border-b border-gray-100 bg-white/95 backdrop-blur-md px-6 py-8 shadow-xl"
                    contentClassName="mx-auto max-w-screen-2xl"
                    onMouseEnter={() => {
                        keepPanelOpen();
                        setActiveItemId(activeItem.id);
                    }}
                    onMouseLeave={closePanelSoon}
                >
                    <div
                        key={activeItem.id}
                        className="motion-safe:animate-[menu-content-swap_220ms_cubic-bezier(0.22,1,0.36,1)] grid grid-cols-[1fr_280px] items-stretch gap-10 lg:gap-14"
                    >
                        <div className="space-y-6">
                            {/* TOP LEVEL UNGROUPED LINKS */}
                            {activeItem.items.some((child) => !child.items?.length && child !== newInItem) && (
                                <ul className="flex flex-wrap gap-x-8 gap-y-3 border-b border-gray-100 pb-5">
                                    {activeItem.items.filter((child) =>
                                        !child.items?.length && child !== newInItem
                                    ).map((child) => (
                                        <li key={child.id}>
                                            <MenuLink item={child} className="text-sm font-medium text-gray-900 hover:text-black" />
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* SUB-GROUPS COLUMNS */}
                            <ul className="grid grid-cols-3 gap-x-8 gap-y-6">
                                {activeItem.items.filter((child) => child.items?.length).map((group) => (
                                    <li key={group.id} className="space-y-3">
                                        <MenuLink item={group} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900" showArrow />
                                        <ul className="space-y-2">
                                            {group.items?.map((child) => (
                                                <li key={child.id}>
                                                    <MenuLink item={child} className="text-sm text-gray-600 hover:text-black transition-colors" />
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* FEATURED BANNER CARD */}
                        <Link href={newInItem?.url ? normalizeMenuUrl(newInItem.url) : activeItem.url ? normalizeMenuUrl(activeItem.url) : "#"} className="group relative flex flex-col justify-between overflow-hidden rounded-md bg-[#f4eee9]">
                            <div className="relative min-h-[180px] flex-1 overflow-hidden bg-[radial-gradient(circle_at_60%_35%,#d8c4b4,#eee5de_45%,#c5d0ce)]">
                                {newInImage ? (
                                    <Image src={newInImage} alt={newInItem?.title || `New in ${activeItem.title}`} fill sizes="280px" unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full min-h-[180px] items-center justify-center text-6xl font-light text-white/80">
                                        {activeItem.title.slice(0, 1)}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between bg-black px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors group-hover:bg-gray-800">
                                <span>{newInItem?.title || `New in ${activeItem.title}`}</span>
                                <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </Link>
                    </div>
                </OverlayPanel>
            ) : null}

            <details className="group md:hidden">
                <summary className="flex size-10 list-none items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
                    <span className="sr-only">Toggle navigation menu</span>
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path className="group-open:hidden" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                        <path className="hidden group-open:block" strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                    </svg>
                </summary>

                <OverlayPanel className="max-h-[calc(100dvh-4rem)] overflow-y-auto">
                    <nav aria-label="Mobile navigation">
                        <ul className="divide-y divide-gray-100">
                        {nav.map((item) => (
                            <li key={item.id} className="py-3">
                                {item.url ? (
                                    <Link href={normalizeMenuUrl(item.url)} className="block font-medium text-gray-900">
                                        {item.title}
                                    </Link>
                                ) : (
                                    <span className="block font-medium text-gray-900">{item.title}</span>
                                )}

                                {!!item.items?.length && (
                                    <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 pl-3">
                                        {item.items.filter((child) =>
                                            child.title.trim().toLowerCase() !== "new in"
                                        ).map((child) => (
                                            <li key={child.id}>
                                                {child.url ? (
                                                    <Link href={normalizeMenuUrl(child.url)} className={`text-sm hover:text-black ${child.items?.length ? "font-semibold text-gray-500" : "text-gray-600"}`}>
                                                        {child.title}
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm text-gray-600">{child.title}</span>
                                                )}
                                                {child.items?.length ? (
                                                    <ul className="mt-1 space-y-1 pl-3">
                                                        {child.items.map((grandchild) => (
                                                            <li key={grandchild.id}>
                                                                <MenuLink item={grandchild} className="text-sm text-gray-600" />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                        <li className="py-3">
                            <WishlistButton className="flex size-auto items-center justify-start gap-3 rounded-none text-gray-900" />
                        </li>
                        <li className="py-3">
                            <Account variant="menu" authenticated={authenticated} customer={customer} />
                        </li>
                        </ul>
                    </nav>
                </OverlayPanel>
            </details>
        </div>
    )
}

function MenuLink({ item, className = "", showArrow = false }: { item: MenuItem; className?: string; showArrow?: boolean }) {
    const content = <>{item.title}{showArrow && <span aria-hidden="true" className="text-base font-normal">›</span>}</>;
    return item.url ? <Link href={normalizeMenuUrl(item.url)} className={`transition-colors hover:text-black ${className}`}>{content}</Link> : <span className={className}>{content}</span>;
}
