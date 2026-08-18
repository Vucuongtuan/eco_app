"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { Image as ShopifyImage } from "@/lib/shopify/types";

type AccountMode = "login" | "register";

type AccountPanelProps = {
  visuals: { loginImage: ShopifyImage | null; registerImage: ShopifyImage | null };
};

export function AccountPanel({ visuals }: AccountPanelProps) {
  const [mode, setMode] = useState<AccountMode>("login");
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/customer/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode, email: form.get("email"), password: form.get("password"), firstName: form.get("firstName") }) });
      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        setError(payload.error ?? "Something went wrong.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const view = mode === "login"
    ? { title: "Welcome back", subtitle: "Sign in to continue your Moon Co. journey.", image: visuals.loginImage }
    : { title: "Join Moon Co.", subtitle: "Create an account and make every piece yours.", image: visuals.registerImage };

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#f8f7f5] pt-16">
      <div className="grid min-h-[calc(100dvh-4rem)] grid-cols-1 lg:grid-cols-2">
        <section className="order-2 flex items-center justify-center px-6 py-16 sm:px-12 lg:order-1 lg:px-20">
          <div className="w-full max-w-md">
            <div className="mt-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{mode === "login" ? "Account" : "Create account"}</p>
              <h1 className="mt-4 text-4xl font-light tracking-tight text-gray-900">{view.title}</h1>
              <p className="mt-3 text-sm leading-6 text-gray-600">{view.subtitle}</p>

              <form onSubmit={submit} className="mt-10 space-y-5">
                {mode === "register" ? <label className="block text-sm text-gray-700">Full name<input name="firstName" type="text" className="mt-2 block w-full border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm outline-none focus:border-black" /></label> : null}
                <label className="block text-sm text-gray-700">Email address<input name="email" required type="email" className="mt-2 block w-full border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm outline-none focus:border-black" /></label>
                <label className="block text-sm text-gray-700">Password<input name="password" required type="password" className="mt-2 block w-full border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm outline-none focus:border-black" /></label>
                {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
                <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 bg-black px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400">
                  {isSubmitting ? <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
                  {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-600">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button type="button" onClick={() => { setError(""); setMode(mode === "login" ? "register" : "login"); }} className="font-medium text-gray-900 underline underline-offset-4">{mode === "login" ? "Create one" : "Sign in"}</button>
              </p>
            </div>
          </div>
        </section>

        <section className="order-1 relative hidden overflow-hidden bg-[#e8dfd5] lg:order-2 lg:block" aria-label={`${mode} account visual`}>
          {view.image ? <Image key={view.image.url} src={view.image.url} alt={view.image.altText ?? ""} fill priority className={cn("object-cover transition-opacity duration-500", mode === "register" && "opacity-90")} /> : <div className="absolute inset-0 bg-[#e8dfd5]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <p className="absolute bottom-10 left-10 max-w-xs text-sm leading-6 text-white">Thoughtful pieces for everyday movement.</p>
        </section>
      </div>
    </main>
  );
}
