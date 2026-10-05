import type { MenuItem } from "@/lib/shopify/types";

export function normalizeMenuUrl(value: string) {
    try {
        const url = new URL(value, "https://local.moon-co.test");
        if (url.hostname.endsWith(".myshopify.com") || url.hostname.endsWith(".shopify.com")) {
            return `${url.pathname}${url.search}${url.hash}`;
        }
    } catch {
        return value;
    }
    return value;
}

export function isNewInItem(item: MenuItem) {
    return item.title.trim().toLowerCase() === "new in";
}

export function getCollectionHandle(url?: string | null) {
    if (!url) return undefined;
    return normalizeMenuUrl(url).match(/\/collections\/([^/?#]+)/)?.[1];
}
