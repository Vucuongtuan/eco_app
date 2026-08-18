
"use client";

import { useCartStore } from "@/context/zustand.provider";
import Account from "./Account";
import Search from "./Search";
import { WishlistButton } from "@/components/WishlistButton";
import type { ProductCard } from "@/lib/shopify/types";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import type { CurrentCustomer } from "@/lib/shopify";

export default function Actions({ trendingProducts, authenticated, customer }: { trendingProducts: ProductCard[]; authenticated: boolean; customer: CurrentCustomer | null }) {
    const toggleCart = useCartStore((store) => store.toggleCart);

    const actionClass =
        "group relative inline-flex size-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-black sm:size-10";

    return (
        <div className="flex items-center justify-end sm:gap-1">
            <Search trendingProducts={trendingProducts} />
            <WishlistButton />

            <span className="hidden md:block">
                <Account authenticated={authenticated} customer={customer} />
            </span>

            <button
                type="button"
                className={actionClass}
                aria-label="Open cart"
                onClick={toggleCart}
            >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 sm:size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h2l1.35 9.45a2 2 0 0 0 2 1.72h7.82a2 2 0 0 0 1.96-1.61L20.25 9H7" />
                    <circle cx="10" cy="19" r="1" fill="currentColor" stroke="none" />
                    <circle cx="18" cy="19" r="1" fill="currentColor" stroke="none" />
                </svg>
            </button>
            <CartDrawer />
            <WishlistDrawer />
        </div>
    )
}
