import "server-only";
import type { WishlistItem } from "./customers";

type CustomerData = { customer: { id: string; metafield: { value: string | null } | null } | null };

export async function getCustomerAccountIdentity(token: string) {
  const data = await customerRequest<{ customer: { id: string } | null }>(token, `query { customer { id } }`);
  return data.customer;
}

async function openIdConfiguration() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const response = await fetch(`https://${domain}/.well-known/openid-configuration`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Shopify OpenID discovery failed (${response.status})`);
  return (await response.json()) as { authorization_endpoint: string; token_endpoint: string };
}

export async function customerAuthorizationUrl(
  state: string,
  mode: "login" | "register" = "login",
) {
  const config = await openIdConfiguration();
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const redirectUri = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL?.trim();
  if (!clientId || !redirectUri)
    throw new Error("Missing Shopify Customer Account OAuth configuration");
  const url = new URL(config.authorization_endpoint);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("locale", "en");
  if (mode === "register") url.searchParams.set("prompt", "create");
  return url.toString();
}

export async function exchangeCustomerCode(code: string) {
  const config = await openIdConfiguration();
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  const redirectUri = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL?.trim();
  if (!clientId || !clientSecret || !redirectUri)
    throw new Error("Missing Shopify Customer Account OAuth configuration");
  const response = await fetch(config.token_endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });
  const body = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!response.ok || !body.access_token)
    throw new Error(
      body.error ?? `Shopify Customer Account token exchange failed (${response.status})`,
    );
  return body as { access_token: string; refresh_token?: string; expires_in?: number };
}

async function customerRequest<T>(
  token: string,
  query: string,
  variables: Record<string, unknown> = {},
) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const discovery = await fetch(`https://${domain}/.well-known/customer-account-api`, {
    cache: "no-store",
  });
  const config = (await discovery.json()) as { graphql_api?: string };
  if (!config.graphql_api)
    throw new Error("Customer Account API discovery did not return graphql_api");
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
    throw new Error(
      `Customer Account API returned ${response.status} ${response.statusText}: ${raw.slice(0, 160)}`,
    );
  }
  if (!response.ok || body.errors?.length || !body.data)
    throw new Error(
      body.errors?.map((error) => error.message).join("; ") ||
        `Customer Account API failed (${response.status})`,
    );
  return body.data;
}

export async function getCustomerWishlist(token: string) {
  const data = await customerRequest<CustomerData>(
    token,
    `
    query CustomerWishlist {
      customer { id metafield(namespace: "custom", key: "wishlist") { value } }
    }
  `,
  );
  let items: WishlistItem[] = [];
  try {
    items = JSON.parse(data.customer?.metafield?.value ?? "[]") as WishlistItem[];
  } catch {
    /* Invalid CMS data is treated as empty. */
  }
  return { customerId: data.customer?.id, items };
}

export async function saveCustomerWishlist(
  token: string,
  customerId: string,
  items: WishlistItem[],
) {
  const data = await customerRequest<{
    metafieldsSet: { userErrors: Array<{ field: string[]; message: string }> };
  }>(
    token,
    `
    mutation SaveWishlist($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { userErrors { field message } }
    }
  `,
    {
      metafields: [
        {
          ownerId: customerId,
          namespace: "custom",
          key: "wishlist",
          type: "json",
          value: JSON.stringify(items),
        },
      ],
    },
  );
  return data.metafieldsSet.userErrors;
}
