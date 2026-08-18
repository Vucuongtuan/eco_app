"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OverlayPanel } from "@/components/common";
import type { ProductCard } from "@/lib/shopify/types";
import Link from "next/link";
import { ProductCard as ProductCardUI } from "@/components/Card";

function SearchIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 sm:size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6.5" />
            <path strokeLinecap="round" d="m16 16 4 4" />
        </svg>
    );
}

export default function Search({ trendingProducts }: { trendingProducts: ProductCard[] }) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [query, setQuery] = useState("");

    function toggleSearch() {
        setIsOpen((open) => {
            if (!open) {
                setIsMounted(true);
                window.setTimeout(() => inputRef.current?.focus(), 0);
            }
            return !open;
        });
    }

    function closeSearch() {
        setIsOpen(false);
    }

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const value = query.trim();
        if (!value) return;
        closeSearch();
        router.push(`/search?q=${encodeURIComponent(value)}`);
    }

    return (
        <div className="relative">
            <button
                type="button"
                className="group relative inline-flex size-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-black sm:size-10"
                aria-label={isOpen ? "Close search" : "Open search"}
                aria-expanded={isOpen}
                aria-controls="site-search-panel"
                onClick={toggleSearch}
            >
                {isOpen ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 sm:size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                    </svg>
                ) : <SearchIcon />}
            </button>

            {isMounted && (
                <OverlayPanel
                    id="site-search-panel"
                    className={` origin-top min-h-32 ${isOpen ? "motion-safe:animate-[search-panel-in_420ms_cubic-bezier(0.22,1,0.36,1)]" : "motion-safe:animate-[search-panel-out_320ms_cubic-bezier(0.4,0,1,1)_forwards]"}`}
                    onAnimationEnd={() => {
                        if (!isOpen) setIsMounted(false);
                    }}
                >
                    <form role="search" onSubmit={submitSearch}>
                        <label htmlFor="site-search" className="sr-only">Search products</label>
                        <div className="flex w-full items-center gap-3 border-b border-gray-300 pb-3 focus-within:border-black">
                            <span className="text-gray-500 [&>svg]:size-6 md:[&>svg]:size-7">
                                <SearchIcon />
                            </span>
                            <input
                                ref={inputRef}
                                id="site-search"
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search products"
                                className="min-w-0 flex-1 border-0 bg-transparent text-lg outline-none placeholder:text-lg placeholder:text-gray-400 md:text-2xl md:placeholder:text-2xl"
                            />
                            <button type="submit" className="text-sm font-medium text-gray-900 disabled:text-gray-400 md:text-base" disabled={!query.trim()}>
                                Search
                            </button>
                        </div>
                    </form>
                    <section className="mt-8" aria-labelledby="trending-products-title">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 id="trending-products-title" className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Trending Products</h2>
                            <Link href="/collections/all" className="text-xs font-medium text-gray-900 underline underline-offset-4">View more</Link>
                        </div>
                        <div className="grid grid-cols-6 gap-3">
                            {trendingProducts.map((product) => {
                                const variant = product.variants?.nodes[0];
                                if (!variant) return null;
                                return <ProductCardUI
                                    key={product.id}
                                    href={`/products/${product.handle}`}
                                    title={product.title}
                                    image={product.featuredImage}
                                    price={product.priceRange.minVariantPrice}
                                    variants={[{
                                        id: variant.id,
                                        price: variant.price,
                                        image: variant.image ?? product.featuredImage,
                                        images: product.images?.nodes,
                                        sizes: product.variants?.nodes.map((item) => ({ label: item.title, available: item.availableForSale })),
                                    }]}
                                />;
                            })}
                        </div>
                    </section>
                    {/* Future search results, suggestions, and merchandising blocks can render here. */}
                </OverlayPanel>
            )}
        </div>
    );
}
