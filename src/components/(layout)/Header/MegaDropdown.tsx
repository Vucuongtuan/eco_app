//@ts-nocheck

"use client";

import { Header } from "@/payload-types";
import { resolveLink, resolveTitle } from "@/utilities/getLinkAndTitle";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { memo } from "react";

interface MegaDropdownProps {
  isOpen: boolean;
  activeItem: Header["navItems"][0] | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const MegaDropdown = memo(function MegaDropdown({
  isOpen,
  activeItem,
  onMouseEnter,
  onMouseLeave,
}: MegaDropdownProps) {
  if (!activeItem?.child?.length) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-0 w-full bg-[var(--color-primary-background)] z-40"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="container mx-auto px-6 py-8">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-4 gap-8"
            >
              {activeItem.child.slice(0, 3).map((childItem, index) => (
                <div key={childItem.id || index}>
                  <Link
                    href={resolveLink(childItem)}
                    className="block font-semibold text-lg mb-4 hover:text-gray-600 transition-colors"
                  >
                    {resolveTitle(childItem)}
                  </Link>
                  {childItem.subChild?.length && (
                    <ul className="space-y-2">
                      {childItem.subChild.map((subItem, subIndex) => (
                        <li key={subItem.id || subIndex}>
                          <Link
                            href={resolveLink(subItem)}
                            className="text-gray-600 hover:text-black transition-colors text-sm"
                          >
                            {resolveTitle(subItem)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Cột cuối để trống cho hình ảnh sau này */}
              <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Featured Image</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
