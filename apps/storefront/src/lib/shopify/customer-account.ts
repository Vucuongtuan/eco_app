import "server-only";
import type { WishlistItem } from "./customers";

type CustomerData = { customer: { id: string; metafield: { value: string | null } | null } | null };

async function customerRequest<T>(token: string, query: string, variables: Record<string, unknown> = {}) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const discovery = await fetch(`https://${domain}/.well-known/customer-account-api`, { cache: "no-store" });
  const config = await discovery.json() as { graphql_api?: string };
  if (!config.graphql_api) throw new Error("Customer Account API discovery did not return graphql_api");
  const response = await fetch(config.graphql_api, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: token },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const raw = await response.text();
  let body: { data?: T; errors?: Array<{ message: string }> };
  try {
    body = JSON.parse(raw) as { data?: T; errors?: Array<{ message: string }> };
  } catch {
    throw new Error(`Customer Account API returned ${response.status} ${response.statusText}: ${raw.slice(0, 160)}`);
  }
  if (!response.ok || body.errors?.length || !body.data) throw new Error(body.errors?.map((error) => error.message).join("; ") || `Customer Account API failed (${response.status})`);
  return body.data;
}

export async function getCustomerWishlist(token: string) {
  const data = await customerRequest<CustomerData>(token, `
    query CustomerWishlist {
      customer { id metafield(namespace: "custom", key: "wishlist") { value } }
    }
  `);
  let items: WishlistItem[] = [];
  try { items = JSON.parse(data.customer?.metafield?.value ?? "[]") as WishlistItem[]; } catch { /* Invalid CMS data is treated as empty. */ }
  return { customerId: data.customer?.id, items };
}

export async function saveCustomerWishlist(token: string, customerId: string, items: WishlistItem[]) {
  const data = await customerRequest<{ metafieldsSet: { userErrors: Array<{ field: string[]; message: string }> } }>(token, `
    mutation SaveWishlist($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { userErrors { field message } }
    }
  `, { metafields: [{ ownerId: customerId, namespace: "custom", key: "wishlist", type: "json", value: JSON.stringify(items) }] });
  return data.metafieldsSet.userErrors;
}
