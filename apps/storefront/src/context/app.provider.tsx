"use client";

import type { ReactNode } from "react";
import { TanStackProvider } from "./tanstack.provider";
import { ZustandProvider } from "./zustand.provider";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <TanStackProvider>
      <ZustandProvider>{children}</ZustandProvider>
    </TanStackProvider>
  );
}

