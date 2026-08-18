type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function adminAccessToken(store: string): Promise<string> {
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  if (clientId && clientSecret) {
    const response = await fetch(`https://${store}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const body = await response.json() as { access_token?: string; error?: string; error_description?: string };
    if (!response.ok || !body.access_token) {
      throw new Error(`Shopify token request failed (${response.status}): ${body.error_description ?? body.error ?? "unknown error"}`);
    }
    return body.access_token;
  }
  return required("SHOPIFY_ADMIN_ACCESS_TOKEN");
}

export async function shopifyAdminGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const store = required("SHOPIFY_STORE")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (!store.endsWith(".myshopify.com")) {
    throw new Error("SHOPIFY_STORE must be a *.myshopify.com hostname");
  }

  const version = process.env.SHOPIFY_API_VERSION?.trim() || "2026-07";
  const accessToken = await adminAccessToken(store);
  const response = await fetch(`https://${store}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-access-token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30_000),
  });

  const body = (await response.json()) as GraphqlResponse<T>;
  if (!response.ok) throw new Error(`Shopify HTTP ${response.status}: ${JSON.stringify(body)}`);
  if (body.errors?.length) throw new Error(`Shopify GraphQL: ${JSON.stringify(body.errors)}`);
  if (!body.data) throw new Error("Shopify response did not contain data");
  return body.data;
}
