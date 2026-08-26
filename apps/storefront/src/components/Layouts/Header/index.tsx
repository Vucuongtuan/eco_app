import { Suspense } from "react";
import Image from "next/image"
import Link from "next/link"
import HeaderActions from "./HeaderActions";
import HeaderNavigation from "./HeaderNavigation";

function NavigationFallback() {
    return <div className="order-1 size-10 md:order-2" aria-hidden="true" />;
}

function ActionsFallback() {
    return <div className="order-3 min-w-0 justify-self-end" aria-hidden="true" />;
}

export default function Header () {
    return (
        <header className="fixed inset-x-0 top-0 z-50 grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-gray-100 bg-white/95 px-3 backdrop-blur-sm sm:px-6 md:grid-cols-[minmax(140px,1fr)_auto_minmax(140px,1fr)]">
            <div className="order-2 flex-1 flex  min-w-0 justify-center md:order-1 md:justify-start">
                <Link href="/" aria-label="Moon Co. home" className="flex items-center">
                    <Image
                        src="/Header_B.svg"
                        alt="Moon Co."
                        width={220}
                        height={120}
                        className="h-auto w-40 md:w-44"
                        priority
                    />
                </Link>
            </div>

            <Suspense fallback={<NavigationFallback />}>
                <HeaderNavigation />
            </Suspense>

            <div className="order-3 min-w-0 justify-self-end">
                <Suspense fallback={<ActionsFallback />}>
                    <HeaderActions />
                </Suspense>
            </div>
        </header>
    )
}
