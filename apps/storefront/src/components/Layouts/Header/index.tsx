import { getCollectionsAction, getCurrentCustomerAction, getMainMenuAction, getTrendingProductsAction } from "@/services/actions"
import Image from "next/image"
import Link from "next/link"
import Navigation from "./Navigation"
import Actions from "./Actions"
import { cookies } from "next/headers"


export default async function Header () {
    const navData = await getMainMenuAction()
    const collections = await getCollectionsAction(100)
    const trendingProducts = await getTrendingProductsAction()
    const authenticated = (await cookies()).has("shopify_customer_access_token")
    const customer = await getCurrentCustomerAction()
    const collectionImages = Object.fromEntries(
        collections.nodes
            .filter((collection) => collection.image?.url)
            .map((collection) => [collection.handle, collection.image!.url]),
    )
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

            <Navigation className="order-1 md:order-2" nav={navData?.items ?? []} collectionImages={collectionImages} authenticated={Boolean(customer)} customer={customer}/>

            <div className="order-3 min-w-0 justify-self-end">
                <Actions trendingProducts={trendingProducts} authenticated={Boolean(customer)} customer={customer} />
            </div>
        </header>
    )
}
