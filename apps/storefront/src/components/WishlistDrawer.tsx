"use client";

import { Drawer } from "@/components/common";
import { useWishlistStore } from "@/stores/wishlist.store";

export function WishlistDrawer() {
  const open = useWishlistStore((state) => state.isOpen);
  const close = useWishlistStore((state) => state.closeDrawer);
  const count = useWishlistStore((state) => state.productIds.length);
  return <Drawer open={open} onClose={close} title="My Wishlist"><div className="flex min-h-full items-center justify-center p-6 text-sm text-gray-500">{count ? `${count} item${count === 1 ? "" : "s"} saved.` : "Your wishlist is empty."}</div></Drawer>;
}
