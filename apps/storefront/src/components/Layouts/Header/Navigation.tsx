"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/shopify/types";
import { OverlayPanel } from "@/components/common";
import { getCollectionHandle, isNewInItem, normalizeMenuUrl } from "./menu-utils";

type NavigationProps = {
    nav: MenuItem[];
    className?: string;
    collectionImages?: Record<string, string>;
};

const OPEN_DELAY = 80;
const CLOSE_DELAY = 180;

/** Menu desktop (mega-menu). Chỉ hiển thị từ breakpoint md trở lên. */
export default function Navigation({ nav, className = "", collectionImages = {} }: NavigationProps) {
    const pathname = usePathname();
    const rootRef = useRef<HTMLDivElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    const activeItem = nav.find((item) => item.id === activeItemId);
    const newInItem = activeItem?.items?.find(isNewInItem);
    const newInHandle = getCollectionHandle(newInItem?.url);
    const newInImage = newInHandle ? collectionImages[newInHandle] : undefined;

    function schedule(id: string | null, delay: number) {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setActiveItemId(id), delay);
    }

    function cancel() {
        clearTimeout(timer.current);
    }

    // Đổi trang -> đóng menu.
    useEffect(() => {
        setActiveItemId(null);
    }, [pathname]);

    // Escape -> đóng menu. Dọn timer khi unmount.
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setActiveItemId(null);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            clearTimeout(timer.current);
        };
    }, []);

    const linkClass =
        "relative inline-flex items-center py-1 text-[0.72rem] font-medium tracking-[0.12em] text-gray-600 uppercase transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:text-black hover:after:scale-x-100 focus-visible:text-black focus-visible:after:scale-x-100 lg:text-[0.76rem]";

    const ungrouped = activeItem?.items?.filter((child) => !child.items?.length && child !== newInItem) ?? [];
    const groups = activeItem?.items?.filter((child) => child.items?.length) ?? [];

    return (
        <div
            ref={rootRef}
            className={`col-start-2 row-start-1 hidden md:block ${className}`}
            onMouseEnter={cancel}
            onMouseLeave={() => schedule(null, CLOSE_DELAY)}
            onBlur={(event) => {
                // Focus rời khỏi toàn bộ vùng nav + panel -> đóng.
                if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setActiveItemId(null);
            }}
        >
            <nav aria-label="Primary navigation">
                <ul className="flex items-center justify-center gap-4 lg:gap-6">
                    {nav.map((item) => {
                        const hasChildren = Boolean(item.items?.length);
                        return (
                            <li
                                key={item.id}
                                className="leading-none"
                                onMouseEnter={() => schedule(hasChildren ? item.id : null, activeItemId ? 0 : OPEN_DELAY)}
                                onFocus={() => {
                                    cancel();
                                    setActiveItemId(hasChildren ? item.id : null);
                                }}
                            >
                                {item.url ? (
                                    <Link href={normalizeMenuUrl(item.url)} className={linkClass}>
                                        {item.title}
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center py-1 text-[0.72rem] font-medium tracking-[0.12em] text-gray-600 uppercase lg:text-[0.76rem]">
                                        {item.title}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {activeItem?.items?.length ? (
                <OverlayPanel
                    className="border-b border-gray-200 bg-white px-5 py-7 shadow-[0_12px_30px_rgba(17,17,17,0.06)]"
                    contentClassName="mx-auto w-full max-w-screen-2xl"
                >
                    <div
                        key={activeItem.id}
                        className="motion-safe:animate-[menu-content-swap_220ms_cubic-bezier(0.22,1,0.36,1)] grid grid-cols-[minmax(0,1fr)_280px] items-stretch gap-8 lg:gap-12"
                    >
                        <div className="space-y-6">
                            {ungrouped.length > 0 && (
                                <ul className="flex flex-wrap gap-x-8 gap-y-3 border-b border-gray-100 pb-5">
                                    {ungrouped.map((child) => (
                                        <li key={child.id}>
                                            <MenuLink item={child} className="text-sm font-medium text-gray-900" />
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <ul className="grid grid-cols-3 gap-x-8 gap-y-6">
                                {groups.map((group) => (
                                    <li key={group.id} className="space-y-3">
                                        <MenuLink
                                            item={group}
                                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900"
                                            showArrow
                                        />
                                        <ul className="space-y-2">
                                            {group.items?.map((child) => (
                                                <li key={child.id}>
                                                    <MenuLink item={child} className="text-sm text-gray-600" />
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Banner nổi bật */}
                        <Link
                            href={
                                newInItem?.url
                                    ? normalizeMenuUrl(newInItem.url)
                                    : activeItem.url
                                      ? normalizeMenuUrl(activeItem.url)
                                      : "#"
                            }
                            className="group relative flex flex-col justify-between overflow-hidden rounded-md bg-[#f4eee9]"
                        >
                            <div className="relative min-h-45 flex-1 overflow-hidden bg-[radial-gradient(circle_at_60%_35%,#d8c4b4,#eee5de_45%,#c5d0ce)]">
                                {newInImage ? (
                                    <Image
                                        src={newInImage}
                                        alt={newInItem?.title || `New in ${activeItem.title}`}
                                        fill
                                        sizes="280px"
                                        unoptimized
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full min-h-45 items-center justify-center text-6xl font-light text-white/80">
                                        {activeItem.title.slice(0, 1)}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between bg-black px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors group-hover:bg-gray-800">
                                <span>{newInItem?.title || `New in ${activeItem.title}`}</span>
                                <span aria-hidden="true" className="text-sm transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </Link>
                    </div>
                </OverlayPanel>
            ) : null}
        </div>
    );
}

function MenuLink({ item, className = "", showArrow = false }: { item: MenuItem; className?: string; showArrow?: boolean }) {
    const content = (
        <>
            {item.title}
            {showArrow && <span aria-hidden="true" className="text-base font-normal">›</span>}
        </>
    );
    return item.url ? (
        <Link href={normalizeMenuUrl(item.url)} className={`transition-colors hover:text-black ${className}`}>
            {content}
        </Link>
    ) : (
        <span className={className}>{content}</span>
    );
}
