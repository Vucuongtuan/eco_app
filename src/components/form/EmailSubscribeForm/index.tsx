"use client";

import { subscribeNewsletter } from "@/service/actions";
import { Lang } from "@/types";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState, useTransition } from "react";

export default function EmailSubscribeForm() {
  const locale = useLocale();
  const t = useTranslations("emailsubscribe");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const onSubscribe = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      startTransition(async () => {
        const result = await subscribeNewsletter(
          e.currentTarget.email.value,
          locale as Lang
        );
        console.log("Subscribe result:", result);
        if (result) {
          setIsSubscribed(true);
        } else {
          setIsError(true);
          setIsSubscribed(true);
        }
      });
    },
    [locale]
  );

  return (
    <div className="w-full min-h-42">
      <div className="max-w-md mx-auto p-0">
        <h3 className="text-2xl font-medium text-gray-800">{t("title")}</h3>
        <p className="text-sm text-gray-600 mt-1 mb-4">{t("description")}</p>

        {isSubscribed ? (
          <div className="mt-4">
            <p className="text-gray-700">
              {isError ? `${t("subscribeError")}` : `${t("subscribeSuccess")}`}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubscribe} className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <input
                name="email"
                type="email"
                required
                placeholder={t("placeholder")}
                aria-label="Email"
                className="flex-1 rounded-md border  px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-300"
              />

              <select
                defaultValue={locale || "vi"}
                aria-label="Locale"
                className="rounded-md border  bg-white px-3 py-2 text-sm"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-1 rounded-md border bg-transparent text-gray-800 py-2 px-4 hover:bg-gray-50 disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? t("subscribing") : t("subscribe")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
