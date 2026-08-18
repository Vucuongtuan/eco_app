import "server-only";

const storeDomain = () => {
  const value = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  if (!value) throw new Error("Missing SHOPIFY_STORE_DOMAIN");
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
};

export function customerCallbackUrl() {
  const value = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL?.trim();
  if (!value) throw new Error("Missing SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL");
  return value;
}

export async function customerAuthorizationUrl(state: string, mode: "login" | "register") {
  const response = await fetch(`https://${storeDomain()}/.well-known/openid-configuration`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to discover Shopify Customer Account endpoints");
  const config = await response.json() as { authorization_endpoint: string };
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SHOPIFY_CLIENT_ID?.trim() ?? "",
    redirect_uri: customerCallbackUrl(),
    scope: "openid email customer-account-api:full",
    state,
    nonce: state,
  });
  if (mode === "register") params.set("screen_hint", "signup");
  return `${config.authorization_endpoint}?${params}`;
}

export async function exchangeCustomerCode(code: string) {
  const discovery = await fetch(`https://${storeDomain()}/.well-known/openid-configuration`, { cache: "no-store" });
  if (!discovery.ok) throw new Error("Unable to discover Shopify Customer Account token endpoint");
  const config = await discovery.json() as { token_endpoint: string };
  const response = await fetch(config.token_endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.SHOPIFY_CLIENT_ID?.trim() ?? "",
      client_secret: process.env.SHOPIFY_CLIENT_SECRET?.trim() ?? "",
      redirect_uri: customerCallbackUrl(),
      code,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Shopify Customer Account token exchange failed");
  return response.json() as Promise<{ access_token: string; refresh_token?: string; expires_in?: number }>;
}
