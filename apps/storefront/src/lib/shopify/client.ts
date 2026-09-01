import "server-only";

const DEFAULT_API_VERSION = "2026-07";

type GraphqlError = {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
};

type GraphqlEnvelope<T> = {
  data?: T;
  errors?: GraphqlError[];
};

export type StorefrontRequestOptions = {
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  accessToken?: string;
};

export class ShopifyStorefrontError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly errors?: GraphqlError[],
  ) {
    super(message);
    this.name = "ShopifyStorefrontError";
  }
}

function requiredEnv(name: "SHOPIFY_STORE_DOMAIN" | "SHOPIFY_STOREFRONT_ACCESS_TOKEN") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function shopDomain() {
  const domain = requiredEnv("SHOPIFY_STORE_DOMAIN")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (!domain.endsWith(".myshopify.com")) {
    throw new Error("SHOPIFY_STORE_DOMAIN must end in .myshopify.com");
  }
  return domain;
}

function storefrontAuthHeader(): Record<string, string> {
  const token = requiredEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const tokenType = process.env.SHOPIFY_STOREFRONT_TOKEN_TYPE?.trim().toLowerCase() || "private";
  if (tokenType === "private") return { "Shopify-Storefront-Private-Token": token };
  if (tokenType === "public") return { "X-Shopify-Storefront-Access-Token": token };
  throw new Error("SHOPIFY_STOREFRONT_TOKEN_TYPE must be private or public");
}

const MAX_CONCURRENT_REQUESTS = 8;
let activeRequests = 0;
const pendingRequests: Array<() => void> = [];

function acquireRequestSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    pendingRequests.push(() => {
      activeRequests += 1;
      resolve();
    });
  });
}

function releaseRequestSlot() {
  activeRequests -= 1;
  pendingRequests.shift()?.();
}

function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const cause = error.cause as { code?: string } | undefined;
  return (
    cause?.code === "ETIMEDOUT" || cause?.code === "ECONNRESET" || cause?.code === "ECONNREFUSED"
  );
}

async function fetchStorefront(
  url: string,
  init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } },
): Promise<Response> {
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await acquireRequestSlot();
    try {
      return await fetch(url, init);
    } catch (error) {
      if (!isRetryableFetchError(error) || attempt === maxAttempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    } finally {
      releaseRequestSlot();
    }
  }
  throw new Error("Shopify Storefront API request failed");
}

export async function storefrontRequest<
  TData,
  TVariables extends Record<string, unknown> = Record<string, never>,
>(query: string, variables?: TVariables, options: StorefrontRequestOptions = {}): Promise<TData> {
  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || DEFAULT_API_VERSION;
  const response = await fetchStorefront(`https://${shopDomain()}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.accessToken
        ? { "X-Shopify-Storefront-Access-Token": options.accessToken }
        : storefrontAuthHeader()),
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
    cache: options.cache,
    next:
      options.cache === "no-store"
        ? undefined
        : {
            revalidate: options.revalidate ?? 60,
            tags: options.tags,
          },
  });

  let body: GraphqlEnvelope<TData>;
  try {
    body = (await response.json()) as GraphqlEnvelope<TData>;
  } catch {
    throw new ShopifyStorefrontError(
      `Shopify returned a non-JSON response (${response.status})`,
      response.status,
    );
  }

  if (!response.ok || body.errors?.length || !body.data) {
    const details = body.errors?.map((error) => error.message).join("; ");
    throw new ShopifyStorefrontError(
      details || `Shopify Storefront API request failed (${response.status})`,
      response.status,
      body.errors,
    );
  }
  return body.data;
}

export function throwOnUserErrors(operation: string, errors: Array<{ message: string }> = []) {
  if (errors.length) {
    throw new ShopifyStorefrontError(
      `${operation}: ${errors.map((error) => error.message).join("; ")}`,
    );
  }
}
