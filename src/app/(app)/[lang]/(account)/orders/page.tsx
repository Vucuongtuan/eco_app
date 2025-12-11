import type { Order } from "@/payload-types";
import type { Metadata } from "next";

import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

import { OrderItem } from "@/components/OrderItem";
import { Button } from "@/components/ui/button";
import configPromise from "@payload-config";
import { headers as getHeaders } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export default async function Orders() {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  let orders: Order[] | null = null;

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent("Please login to access your orders.")}`
    );
  }

  try {
    const ordersResult = await payload.find({
      collection: "orders",
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    });

    orders = ordersResult?.docs || [];
  } catch (error) {}

  return (
    <div className="w-full">
      <h1 className="text-3xl font-medium mb-8 text-text-primary">Orders</h1>

      {(!orders || !Array.isArray(orders) || orders?.length === 0) ? (
        <div className="bg-white border border-[#d1d5db] rounded-lg p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary-background rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-text-primary mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild className="bg-[#3569ed] hover:bg-[#2557d4]">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#d1d5db] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {orders?.map((order) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const metadata: Metadata = {
  description: "Your orders.",
  openGraph: mergeOpenGraph({
    title: "Orders",
    url: "/orders",
  }),
  title: "Orders",
};
