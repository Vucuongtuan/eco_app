import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  // @ts-ignore
  const country = request.geo?.country || "US";
  const isVietnam = country === "VN";

  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;

  const hasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!hasLocale && !savedLocale) {
    if (!isVietnam) {
      const url = request.nextUrl.clone();
      url.pathname = `/en${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  if (!hasLocale && savedLocale && savedLocale !== "vi") {
    const url = request.nextUrl.clone();
    url.pathname = `/${savedLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Use next-intl middleware
  const intlMiddleware = createMiddleware(routing);
  const response = intlMiddleware(request);
  response.headers.set("x-country", country);

  return response;
}

// Config remains the same
export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|next|.*\\..*).*)"],
};
