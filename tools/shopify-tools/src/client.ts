type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
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
  const response = await fetch(`https://${store}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-access-token": required("SHOPIFY_ADMIN_ACCESS_TOKEN"),
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
