"use client";

import { motion } from "framer-motion";

interface SizeSelectorProps {
  sizeVariants: any[];
  selectedSize: any;
  onSizeChange: (size: any) => void;
  variants?: any[];
  selectedColor?: any;
}

export function SizeSelector({
  sizeVariants,
  selectedSize,
  onSizeChange,
  variants,
  selectedColor,
}: SizeSelectorProps) {
  if (sizeVariants.length === 0) return <>null</>;

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-medium">Size</h3>
      <div className="grid grid-cols-5 gap-2">
        {sizeVariants.map((item, idx) => {
          let isOutOfStock = false;
          if (variants && selectedColor) {
            const matchingVariant = variants.find((v) => {
              const hasColor = v.options?.some(
                (opt: any) => opt.id === selectedColor.id
              );
              const hasSize = v.options?.some((opt: any) => opt.id === item.id);
              return hasColor && hasSize;
            });
            isOutOfStock = !matchingVariant || (matchingVariant.inventory || 0) <= 0;
          }

          return (
            <motion.button
              key={idx}
              onClick={() => onSizeChange(item)}
              className={`border py-2 text-center text-sm transition-colors relative ${
                selectedSize?.id === item.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-gray-300 hover:border-gray-400"
              } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={selectedSize?.id === item.id}
              aria-label={`Size ${item.label}`}
            >
              {item.value.toUpperCase()}
              {isOutOfStock && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-gray-500 rotate-45 transform scale-x-100" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
