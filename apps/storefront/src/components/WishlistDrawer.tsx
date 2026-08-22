"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Drawer } from "@/components/common";
import { useWishlistStore } from "@/stores/wishlist.store";

export function WishlistDrawer({ authenticated }: { authenticated: boolean }) {
  const open = useWishlistStore((state) => state.isOpen);
  const close = useWishlistStore((state) => state.closeDrawer);
  const items = useWishlistStore((state) => state.items);
  const hydrate = useWishlistStore((state) => state.hydrate);
  const pathname = usePathname();

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (authenticated) fetch("/api/customer/wishlist").then((response) => response.ok ? response.json() : null).then((data) => data?.items && hydrate(data.items)).catch(() => undefined);
  }, [authenticated, hydrate]);

  return (
    <Drawer open={open} onClose={close} title="My Wishlist">
      <div className="p-4">
        {!authenticated ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Please{" "}
            <Link
              href="/account"
              onClick={close}
              className="mx-1 font-medium text-gray-900 underline underline-offset-4"
            >
              sign in
            </Link>{" "}
            to use your wishlist.
          </p>
        ) : items.length ? (
          <div className="space-y-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={close}
                className="flex gap-3 border-b border-gray-100 pb-4"
              >
                <div className="relative size-20 shrink-0 bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                  {item.price ? <p className="mt-1 text-sm text-gray-500">{item.price}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">Your wishlist is empty.</p>
        )}
      </div>
    </Drawer>
  );
}
