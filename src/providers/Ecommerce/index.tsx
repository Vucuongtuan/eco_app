"use client";

import { EcommerceProvider as PayloadEcommerceProvider } from "@payloadcms/plugin-ecommerce/client/react";
import { stripeAdapterClient } from "@payloadcms/plugin-ecommerce/payments/stripe";
import React from "react";

export const EcommerceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <PayloadEcommerceProvider
      enableVariants={true}
      api={{
        cartsFetchQuery: {
          depth: 1, // Optimization: Reduce depth from 2 to 1 for faster initial load
          populate: {
            products: {
              slug: true,
              title: true,
              gallery: true, // Depth 1 will give IDs, need to verify if UI handles this. Usually safer to keep critical data light.
              priceInVND: true, // Ensure we fetch prices for display
              priceInUSD: true,
            },
            variants: {
              title: true,
              inventory: true,
            },
          },
        },
      }}
      paymentMethods={[
        stripeAdapterClient({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
        }),
      ]}
    >
      {children}
    </PayloadEcommerceProvider>
  );
};
