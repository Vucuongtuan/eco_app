import React from "react";

import { GoogleTagManager } from "@next/third-parties/google";
export const Analytics: React.FC = () => {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <GoogleTagManager
      gtmId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? ""}
    />
  );
};
