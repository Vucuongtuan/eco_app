import { createStore } from "zustand/vanilla";
import type { Cart } from "@/lib/shopify/types";

export type CartState = {
  cartId: string | null;
  cart: Cart | null;
  isCartOpen: boolean;
};

export type CartActions = {
  setCart: (cart: Cart | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  resetCart: () => void;
};

export type CartStore = CartState & CartActions;
export type CartStoreApi = ReturnType<typeof createCartStore>;

const initialState: CartState = {
  cartId: null,
  cart: null,
  isCartOpen: false,
};

export function createCartStore(initState: Partial<CartState> = {}) {
  return createStore<CartStore>()((set) => ({
    ...initialState,
    ...initState,
    setCart: (cart) => set({ cart, cartId: cart?.id ?? null }),
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    resetCart: () => set(initialState),
  }));
}
