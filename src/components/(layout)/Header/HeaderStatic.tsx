"use client";

import { Header } from "@/payload-types";
import { ReactNode } from "react";
import { useHeaderState } from "./hooks/useHeaderState";
import { Logo } from "./Logo";
import { MegaDropdown } from "./MegaDropdown";
import { MobileMenuButton } from "./MobileMenuButton";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import { Navigation } from "./Navigation";

interface HeaderStaticProps {
  navData: Header["navItems"];
  children: ReactNode;
}

export function HeaderStatic({ navData, children }: HeaderStaticProps) {
  const {
    isOpen,
    isScrolled,
    megaDropdownOpen,
    activeItem,
    toggleMenu,
    handleMenuItemHover,
    handleMenuLeave,
    handleDropdownEnter,
    handleDropdownLeave,
  } = useHeaderState(navData);

  return (
    <div className="relative">
      <div
        className={`flex gap-12 items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isScrolled
            ? "h-10 bg-[var(--color-primary-background)]/65 backdrop-blur-lg"
            : "h-17"
        }`}
      >
        <Logo/>
        <div className="flex-1" onMouseLeave={handleMenuLeave}>
          <Navigation navData={navData} onMenuItemHover={handleMenuItemHover} />
          <MegaDropdown
            isOpen={megaDropdownOpen}
            activeItem={activeItem}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          />
        </div>
        {children}
        <MobileMenuButton isOpen={isOpen} onClick={toggleMenu} />
      </div>

      <MobileMenuOverlay
        isOpen={isOpen}
        navData={navData}
        onToggle={toggleMenu}
      />
    </div>
  );
}
