"use client";

import { AddToCart } from "@/components/Cart/AddToCart";
import { Product, Variant } from "@/payload-types";
import { motion } from "framer-motion";
import { Suspense } from "react";

interface ProductActionProps {
  product: Product;
  selectedVariant: Variant | null;
}

export default function ProductAction({
  product,
  selectedVariant,
}: ProductActionProps) {
  return (
    <motion.div
      className="flex items-center gap-3 mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <Suspense fallback={null}>
        <AddToCart
          product={product}
          selectedVariant={selectedVariant || null}
        />
      </Suspense>
    </motion.div>
  );
}
