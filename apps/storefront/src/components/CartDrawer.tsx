"use client";

import { Drawer } from "@/components/common";
import { useCartStore } from "@/context/zustand.provider";

export function CartDrawer() {
  const open = useCartStore((store) => store.isCartOpen);
  const close = useCartStore((store) => store.closeCart);
  return <Drawer open={open} onClose={close} title="Cart"><div className="flex min-h-full items-center justify-center p-6 text-sm text-gray-500">Your cart is empty.</div></Drawer>;
}
