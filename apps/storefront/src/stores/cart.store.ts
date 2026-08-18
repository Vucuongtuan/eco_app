import { createStore } from "zustand/vanilla";

export type CartState = {
  cartId: string | null;
  isCartOpen: boolean;
};

export type CartActions = {
  setCartId: (cartId: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  resetCart: () => void;
};

export type CartStore = CartState & CartActions;
export type CartStoreApi = ReturnType<typeof createCartStore>;

const initialState: CartState = {
  cartId: null,
  isCartOpen: false,
};

export function createCartStore(initState: Partial<CartState> = {}) {
  return createStore<CartStore>()((set) => ({
    ...initialState,
    ...initState,
    setCartId: (cartId) => set({ cartId }),
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    resetCart: () => set(initialState),
  }));
}

