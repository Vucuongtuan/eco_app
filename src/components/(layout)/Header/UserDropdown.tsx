"use client";

import { useAuth } from "@/providers/Auth";
import { LogOut, User, UserCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center space-x-1 hover:opacity-70"
        aria-label="Login"
      >
        <User size={20} />
      </Link>
    );
  }
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 hover:opacity-70"
      >
        <User size={20} />
        <span className="hidden lg:inline">{user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg  z-50">
          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <UserCircle size={16} className="mr-2" />
            Profile
          </Link>
          <Link
            href="/logout"
            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}
