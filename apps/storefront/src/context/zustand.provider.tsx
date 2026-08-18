"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { createCartStore, type CartState, type CartStore, type CartStoreApi } from "@/stores/cart.store";

const CartStoreContext = createContext<CartStoreApi | null>(null);

export function ZustandProvider({
  children,
  initialCartState,
}: {
  children: ReactNode;
  initialCartState?: Partial<CartState>;
}) {
  const [store] = useState(() => createCartStore(initialCartState));

  return <CartStoreContext.Provider value={store}>{children}</CartStoreContext.Provider>;
}

export function useCartStore<T>(selector: (store: CartStore) => T): T {
  const store = useContext(CartStoreContext);
  if (!store) throw new Error("useCartStore must be used inside ZustandProvider");
  return useStore(store, selector);
}
