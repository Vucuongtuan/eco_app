type GraphqlEnvelope<T> = {
  data?: T;
  errors?: unknown;
  extensions?: { cost?: { throttleStatus?: { currentlyAvailable: number; restoreRate: number } } };
};

class AdminGraphqlError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.retryable = retryable;
  }
}

function errorMessages(errors: unknown): string[] {
  if (Array.isArray(errors)) {
    return errors.map((error) => {
      if (typeof error === "string") return error;
      if (error && typeof error === "object" && "message" in error) return String(error.message);
      return JSON.stringify(error);
    });
  }
  if (typeof errors === "string") return [errors];
  if (errors && typeof errors === "object") return [JSON.stringify(errors)];
  return [];
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

let cachedAccessToken: { value: string; expiresAt: number } | null = null;

async function accessToken(store: string): Promise<string> {
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return required("SHOPIFY_ADMIN_ACCESS_TOKEN");
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.value;

  const response = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.json() as {
    access_token?: string; expires_in?: number; error?: string; error_description?: string;
  };
  if (!response.ok || !body.access_token) {
    throw new AdminGraphqlError(
      `Shopify token request failed (${response.status}): ${body.error_description ?? body.error ?? JSON.stringify(body)}`,
      response.status >= 500,
    );
  }
  cachedAccessToken = {
    value: body.access_token,
    expiresAt: Date.now() + Math.max(0, (body.expires_in ?? 86_399) - 60) * 1_000,
  };
  return cachedAccessToken.value;
}

export async function adminGraphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const store = required("SHOPIFY_STORE").replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!store.endsWith(".myshopify.com")) throw new Error("SHOPIFY_STORE must end in .myshopify.com");
  const version = process.env.SHOPIFY_API_VERSION?.trim() || "2026-07";

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const token = await accessToken(store);
      const response = await fetch(`https://${store}/admin/api/${version}/graphql.json`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-shopify-access-token": token },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(60_000),
      });
      const body = await response.json() as GraphqlEnvelope<T>;
      const messages = errorMessages(body.errors);
      const throttled = response.status === 429 || messages.some((message) => /throttled/i.test(message));
      if (throttled && attempt < 5) {
        await wait(1_000 * 2 ** (attempt - 1));
        continue;
      }
      if (!response.ok) {
        throw new AdminGraphqlError(`Shopify HTTP ${response.status}: ${JSON.stringify(body)}`, response.status >= 500);
      }
      if (messages.length) throw new AdminGraphqlError(`Shopify GraphQL: ${messages.join("; ")}`, false);
      if (!body.data) throw new AdminGraphqlError("Shopify response has no data", false);

      const throttle = body.extensions?.cost?.throttleStatus;
      if (throttle && throttle.currentlyAvailable < 100) {
        await wait(Math.ceil((100 - throttle.currentlyAvailable) / throttle.restoreRate) * 1_000);
      }
      return body.data;
    } catch (error) {
      if (error instanceof AdminGraphqlError && !error.retryable) throw error;
      if (attempt === 5) throw error;
      await wait(1_000 * 2 ** (attempt - 1));
    }
  }
  throw new Error("Shopify request exhausted retries");
}
