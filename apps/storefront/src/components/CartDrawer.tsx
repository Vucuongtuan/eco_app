"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/common";
import { useCartStore } from "@/context/zustand.provider";

export function CartDrawer() {
  const open = useCartStore((store) => store.isCartOpen);
  const close = useCartStore((store) => store.closeCart);
  const cart = useCartStore((store) => store.cart);
  const setCart = useCartStore((store) => store.setCart);
  const [updatingLine, setUpdatingLine] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cart")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setCart(data?.cart ?? null))
      .catch(() => undefined);
  }, [setCart]);

  async function updateQuantity(lineId: string, quantity: number) {
    if (updatingLine) return;
    setUpdatingLine(lineId);
    setError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lineId, quantity }),
      });
      const data = await response.json() as { cart?: import("@/lib/shopify/types").Cart; error?: string };
      if (!response.ok || !data.cart) throw new Error(data.error ?? "Unable to update cart.");
      setCart(data.cart);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update cart.");
    } finally {
      setUpdatingLine(null);
    }
  }

  return <Drawer open={open} onClose={close} title={`Cart${cart?.totalQuantity ? ` (${cart.totalQuantity})` : ""}`}>
    {!cart?.lines.nodes.length ? <div className="flex min-h-full items-center justify-center p-6 text-sm text-gray-500">Your cart is empty.</div> : <div className="flex min-h-full flex-col p-4">
      <div className="flex-1 space-y-4">
        {cart.lines.nodes.map((line) => <div key={line.id} className="flex gap-4 border-b border-gray-100 pb-4">
          <div className="relative size-24 shrink-0 bg-gray-100">
            {line.merchandise.image ? <Image src={line.merchandise.image.url} alt={line.merchandise.image.altText ?? line.merchandise.product.title} fill sizes="96px" className="object-cover" /> : null}
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <Link href={`/products/${line.merchandise.product.handle}`} onClick={close} className="font-medium">{line.merchandise.product.title}</Link>
            <p className="mt-1 text-gray-500">{line.merchandise.title}</p>
            <div className="mt-3 flex items-center gap-3">
              <button type="button" aria-label={`Decrease quantity of ${line.merchandise.product.title}`} disabled={updatingLine === line.id} onClick={() => void updateQuantity(line.id, line.quantity - 1)} className="flex size-8 items-center justify-center border border-gray-300 disabled:opacity-40">−</button>
              <span className="min-w-4 text-center">{line.quantity}</span>
              <button type="button" aria-label={`Increase quantity of ${line.merchandise.product.title}`} disabled={updatingLine === line.id} onClick={() => void updateQuantity(line.id, line.quantity + 1)} className="flex size-8 items-center justify-center border border-gray-300 disabled:opacity-40">+</button>
            </div>
            <p className="mt-1">{line.cost.totalAmount.amount} {line.cost.totalAmount.currencyCode}</p>
          </div>
        </div>)}
      </div>
      {error ? <p role="alert" className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="border-t border-gray-200 pt-4">
        <div className="mb-4 flex justify-between text-sm"><span>Subtotal</span><span>{cart.cost.subtotalAmount.amount} {cart.cost.subtotalAmount.currencyCode}</span></div>
        <a href={cart.checkoutUrl} className="block w-full bg-black px-5 py-4 text-center text-sm uppercase tracking-[0.16em] text-white">Checkout</a>
      </div>
    </div>}
  </Drawer>;
}
