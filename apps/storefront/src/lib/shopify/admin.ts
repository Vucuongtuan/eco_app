import "server-only";

const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2026-07";
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAdminToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  if (!domain || !clientId || !clientSecret) throw new Error("Missing Shopify client credentials");
  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Shopify token exchange failed (${response.status})`);
  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    scope?: string;
  };
  console.info("Shopify Admin token scopes:", data.scope ?? "(scope not returned)");
  if (
    data.scope &&
    !data.scope
      .split(",")
      .map((scope) => scope.trim())
      .includes("write_customers")
  ) {
    throw new Error(`Admin token is missing write_customers. Granted scopes: ${data.scope}`);
  }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export async function adminRequest<T>(query: string, variables: Record<string, unknown>) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const response = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Shopify-Access-Token": await getAdminToken(),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const body = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (!response.ok || body.errors?.length || !body.data)
    throw new Error(
      body.errors?.map((error) => error.message).join("; ") ||
        `Shopify Admin API failed (${response.status})`,
    );
  return body.data;
}
