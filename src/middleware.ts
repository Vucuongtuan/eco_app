import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

// Initialize intlMiddleware outside to reuse it across requests
const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const country = request.headers.get("x-vercel-ip-country") || "US";

  const hasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!hasLocale) {
    const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;

    if (
      savedLocale &&
      savedLocale !== "vi" &&
      (routing.locales as string[]).includes(savedLocale)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/${savedLocale}${pathname}`;
      const response = NextResponse.redirect(url);
      response.headers.set("Cache-Control", "public, max-age=3600");
      return response;
    }

    if (!savedLocale && country !== "VN") {
      const url = request.nextUrl.clone();
      url.pathname = `/en${pathname}`;
      const response = NextResponse.redirect(url);
      response.headers.set("Cache-Control", "public, max-age=3600");
      return response;
    }
  }
  const response = intlMiddleware(request);

  response.headers.set("x-country", country);

  return response;
}

export const config = {
  // Pattern to exclude static assets and internal APIs
  matcher: ["/((?!api|_next|_vercel|admin|next|.*\\..*).*)"],
};
