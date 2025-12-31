import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import en from "./messages/en.json";
import { routing } from "./routing";

type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}

// export default getRequestConfig(async ({ requestLocale }) => {
//   "use cache";
//   let locale = await requestLocale;

//   if (!locale || !routing.locales.includes(locale as any)) {
//     locale = routing.defaultLocale;
//   }

//   return {
//     locale,
//     messages: (await import(`./messages/${locale}.json`)).default,
//   };
// });
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
