import Link from "next/link";

const groups = [
  { title: "Explore", links: [["New in", "/collections/all"], ["Men", "/collections/men"], ["Women", "/collections/women"], ["Kids", "/collections/kids"]] },
  { title: "Help", links: [["Contact", "/pages/contact"], ["Shipping & returns", "/pages/shipping-returns"], ["FAQ", "/pages/faq"], ["Size guide", "/pages/size-guide"]] },
  { title: "About", links: [["Our story", "/pages/about"], ["Journal", "/pages/journal"], ["Stores", "/pages/stores"], ["Careers", "/pages/careers"]] },
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-[#f8f7f5] px-5 pb-8 pt-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-screen-3xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Stay in the know</p>
            <h2 className="mt-4 text-3xl font-light tracking-tight text-gray-900">Things worth keeping.</h2>
            <p className="mt-4 text-sm leading-6 text-gray-600">Join our newsletter for new arrivals, thoughtful stories and occasional good things.</p>
            <form className="mt-7 flex border-b border-gray-900 pb-2">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input id="footer-email" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
              <button type="submit" className="text-xs font-semibold uppercase tracking-wider text-gray-900">Sign up →</button>
            </form>
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{group.title}</h3>
              <ul className="mt-5 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-gray-700 transition-colors hover:text-black">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-gray-200 pt-5 text-xs text-gray-500 sm:flex-row">
          <p>© 2026 Moon Co. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/pages/privacy" className="hover:text-black">Privacy</Link>
            <Link href="/pages/terms" className="hover:text-black">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
