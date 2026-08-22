"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  productIds: string[];
  items: Array<{ id: string; title: string; href: string; image?: string | null; price?: string }>;
  isOpen: boolean;
  toggle: (productId: string, item?: WishlistState["items"][number]) => void;
  has: (productId: string) => boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  hydrate: (items: WishlistState["items"]) => void;
};

export const useWishlistStore = create<WishlistState>()(persist((set, get) => ({
  productIds: [],
  items: [],
  isOpen: false,
  toggle: (productId, item) => set((state) => {
    const removing = state.productIds.includes(productId);
    return {
      productIds: removing ? state.productIds.filter((id) => id !== productId) : [...state.productIds, productId],
      items: removing ? state.items.filter((saved) => saved.id !== productId) : item ? [...state.items, item] : state.items,
    };
  }),
  has: (productId) => get().productIds.includes(productId),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  closeDrawer: () => set({ isOpen: false }),
  hydrate: (items) => set({ items, productIds: items.map((item) => item.id) }),
}), { name: "moon-wishlist" }));
