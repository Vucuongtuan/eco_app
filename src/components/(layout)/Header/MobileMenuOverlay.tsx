"use client";

import { SearchButton } from "@/components/Search";
import { Header } from "@/payload-types";
import { useAuth } from "@/providers/Auth";
import { Lang } from "@/types";
import { resolveLink, resolveTitle } from "@/utilities/getLinkAndTitle";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useLocale } from "next-intl";
import Link from "next/link";

interface MobileMenuOverlayProps {
  isOpen: boolean;
  navData: Header["navItems"];
  onToggle: () => void;
}

// Backdrop overlay animation
const backdropVariants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
} as const satisfies Variants;

// Menu panel slide animation
const menuVariants = {
  hidden: {
    x: "100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  visible: {
    x: "0%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
} as const satisfies Variants;

// Container for stagger children
const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
} as const satisfies Variants;

// Individual menu item animation
const itemVariants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
} as const satisfies Variants;

export function MobileMenuOverlay({
  isOpen,
  navData,
  onToggle,
}: MobileMenuOverlayProps) {
  const { status, user, logout } = useAuth();
  const locale = useLocale();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onToggle}
            className="md:hidden fixed inset-0 bg-text-primary/40 backdrop-blur-sm z-40"
          />

          {/* Menu panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            className="md:hidden fixed top-0 right-0 w-[85%] max-w-sm h-screen bg-primary-background shadow-2xl z-50 overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onToggle}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-text-primary/5 hover:bg-text-primary/10 transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5 text-text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Menu content */}
            <nav className="flex flex-col justify-between min-h-full px-8 pt-20 pb-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1"
              >
                {/* Search Button for Mobile */}
                <motion.div
                  variants={itemVariants}
                  className="pb-4 mb-4 border-b border-border-light"
                >
                  <div className="flex justify-center">
                    <SearchButton />
                  </div>
                </motion.div>

                {navData?.map((link) => {
                  if (!link) return null;
                  return (
                    <motion.div key={link.id} variants={itemVariants}>
                      <Link
                        href={resolveLink(link, locale as Lang)}
                        className="block py-3 text-2xl font-display font-light text-text-primary hover:text-text-secondary transition-colors border-b border-border-light hover:border-border"
                        onClick={onToggle}
                      >
                        {resolveTitle(link)}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Auth buttons */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3 pt-8 border-t border-border-light"
              >
                {status === "loggedIn" && user ? (
                  <>
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/account"
                        onClick={onToggle}
                        className="block w-full px-6 py-3.5 text-center text-sm font-medium text-text-primary bg-white/60 backdrop-blur-sm border border-border rounded-lg hover:bg-white transition-all"
                      >
                        Tài khoản
                      </Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <button
                        onClick={() => {
                          logout();
                          onToggle();
                        }}
                        className="w-full px-6 py-3.5 text-sm font-medium text-white bg-text-primary rounded-lg hover:bg-[#111827] transition-all shadow-lg shadow-text-primary/20"
                      >
                        Đăng xuất
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/login"
                        onClick={onToggle}
                        className="block w-full px-6 py-3.5 text-center text-sm font-medium text-text-primary bg-white/60 backdrop-blur-sm border border-border rounded-lg hover:bg-white transition-all"
                      >
                        Đăng nhập
                      </Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Link
                        href="/create-account"
                        onClick={onToggle}
                        className="block w-full px-6 py-3.5 text-center text-sm font-medium text-white bg-text-primary rounded-lg hover:bg-[#111827] transition-all shadow-lg shadow-text-primary/20"
                      >
                        Đăng ký
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
