import { AuthProvider } from "@/providers/Auth";
import React from "react";

import { EcommerceProvider } from "./Ecommerce";
import { HeaderThemeProvider } from "./HeaderTheme";
import { QueryProvider } from "./QueryClient";
import { SonnerProvider } from "./Sonner";
import { ThemeProvider } from "./Theme";

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <HeaderThemeProvider>
            <SonnerProvider />
            <EcommerceProvider>
              {children}
            </EcommerceProvider>
          </HeaderThemeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};
