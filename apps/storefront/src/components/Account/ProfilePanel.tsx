import Link from "next/link";
import type { CurrentCustomer } from "@/lib/shopify";

export function ProfilePanel({ customer }: { customer: CurrentCustomer }) {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Moon Co. member";

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#f8f7f5] px-5 pb-20 pt-32 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-screen-2xl">
        <header className="flex flex-col justify-between gap-8 border-b border-gray-300 pb-10 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">My account</p>
            <h1 className="mt-4 text-4xl font-light tracking-tight text-gray-900 md:text-6xl">{name}</h1>
            <p className="mt-3 text-sm text-gray-600">{customer.email}</p>
          </div>
          <Link href="/api/customer/logout" className="text-sm text-gray-700 underline underline-offset-4 hover:text-black">Sign out</Link>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.38fr)]">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Account overview</p>
            <div className="mt-5 grid gap-px border border-gray-300 bg-gray-300 sm:grid-cols-2">
              <Link href="#orders" className="bg-[#f8f7f5] p-6 transition-colors hover:bg-white"><p className="text-sm font-medium">Orders</p><p className="mt-2 text-sm text-gray-500">View your order history</p></Link>
              <Link href="#details" className="bg-[#f8f7f5] p-6 transition-colors hover:bg-white"><p className="text-sm font-medium">Personal details</p><p className="mt-2 text-sm text-gray-500">Manage your account information</p></Link>
              <Link href="#addresses" className="bg-[#f8f7f5] p-6 transition-colors hover:bg-white"><p className="text-sm font-medium">Addresses</p><p className="mt-2 text-sm text-gray-500">Manage saved addresses</p></Link>
              <Link href="#wishlist" className="bg-[#f8f7f5] p-6 transition-colors hover:bg-white"><p className="text-sm font-medium">Wishlist</p><p className="mt-2 text-sm text-gray-500">View saved pieces</p></Link>
            </div>
          </section>

          <aside id="details" className="border-t border-gray-300 pt-5 lg:border-l lg:border-t-0 lg:pl-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Personal details</p>
            <dl className="mt-6 space-y-5 text-sm">
              <div className="border-b border-gray-200 pb-4"><dt className="text-gray-500">Name</dt><dd className="mt-1 text-gray-900">{name}</dd></div>
              <div className="border-b border-gray-200 pb-4"><dt className="text-gray-500">Email</dt><dd className="mt-1 text-gray-900">{customer.email}</dd></div>
            </dl>
          </aside>
        </div>
      </div>
    </main>
  );
}
