"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  productIds: string[];
  isOpen: boolean;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
};

export const useWishlistStore = create<WishlistState>()(persist((set, get) => ({
  productIds: [],
  isOpen: false,
  toggle: (productId) => set((state) => ({
    productIds: state.productIds.includes(productId)
      ? state.productIds.filter((id) => id !== productId)
      : [...state.productIds, productId],
  })),
  has: (productId) => get().productIds.includes(productId),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  closeDrawer: () => set({ isOpen: false }),
}), { name: "moon-wishlist" }));
