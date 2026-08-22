"use client";

import { useWishlistStore } from "@/stores/wishlist.store";
import { cn } from "@/lib/cn";

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 sm:size-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 8.72c0 5.17-8.84 10.03-8.84 10.03S3.16 13.89 3.16 8.72A4.72 4.72 0 0 1 12 6.1a4.72 4.72 0 0 1 8.84 2.62Z" /></svg>;
}

export function WishlistButton({ productId, item, className }: { productId?: string; item?: { id: string; title: string; href: string; image?: string | null; price?: string }; className?: string }) {
  const isSaved = useWishlistStore((state) => productId ? state.productIds.includes(productId) : false);
  const toggle = useWishlistStore((state) => state.toggle);
  const items = useWishlistStore((state) => state.items);
  const count = useWishlistStore((state) => state.productIds.length);
  const toggleDrawer = useWishlistStore((state) => state.toggleDrawer);

  if (productId) return <button type="button" aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={isSaved} onClick={() => { toggle(productId, item); void fetch("/api/customer/wishlist", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: isSaved ? items.filter((saved) => saved.id !== productId) : item ? [...items, item] : items }) }); }} className={cn("absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full  text-gray-900 transition-transform hover:scale-105", className)}><HeartIcon filled={isSaved} /></button>;

  return <button type="button" onClick={toggleDrawer} aria-label={`Wishlist${count ? `, ${count} saved` : ""}`} className={cn("relative inline-flex size-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:text-black sm:size-10", className)}><HeartIcon /><span className="sr-only">Wishlist</span>{count ? <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-black text-[0.6rem] text-white">{count}</span> : null}</button>;
}
