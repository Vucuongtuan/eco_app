// @ts-nocheck

"use client";

import { login } from "@/service/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
  remember: z.boolean().optional().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  showLayout?: boolean;
}

export function LoginFormContent({ onSuccess }: { onSuccess?: () => void }) {
  const t = useTranslations("login");
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorCode(null);

    startTransition(async () => {
      const res = await login(data);

      if (res.status === 200) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/");
        }
      } else {
        setErrorCode(res.code);
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("title")}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("email_label")}
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-4 py-2.5 border-b-2 border-gray-200 bg-transparent
                     focus:outline-none focus:border-gray-900 transition-colors duration-200
                     placeholder:text-gray-400"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("password_label")}
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-2.5 border-b-2 border-gray-200 bg-transparent
                     focus:outline-none focus:border-gray-900 transition-colors duration-200
                     placeholder:text-gray-400"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              {...register("remember")}
              className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-gray-700"
            >
              {t("remember_me_label")}
            </label>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-gray-900 text-white text-sm font-medium
                     hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
          >
            {isPending ? t("loading") || "Loading..." : t("login_button")}
          </button>
        </div>
        {errorCode && (
          <p className="text-sm text-red-600 text-center">
            {t(`error.${errorCode}`) ||
              t("error.default") ||
              "An error occurred"}
          </p>
        )}
      </form>
      <p className="mt-8 text-center text-sm text-gray-600">
        {t("signup_text")}{" "}
        <a
          href="/signup"
          className="font-medium text-gray-900 hover:text-gray-700 underline underline-offset-2"
        >
          {t("signup_link")}
        </a>
      </p>
    </div>
  );
}

// Layout wrapper for web version
export function LoginForm({ onSuccess, showLayout = true }: LoginFormProps) {
  if (!showLayout) {
    return <LoginFormContent onSuccess={onSuccess} />;
  }

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center bg-gray-50 p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to your account to continue shopping
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <LoginFormContent onSuccess={onSuccess} />
      </div>
    </div>
  );
}
