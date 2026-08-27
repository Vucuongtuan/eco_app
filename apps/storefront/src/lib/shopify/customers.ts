import "server-only";
import { storefrontRequest } from "./client";
import { adminRequest } from "./admin";
import { getCustomerAccountIdentity } from "./customer-account";
export type WishlistItem = {
  id: string;
  title: string;
  href: string;
  image?: string | null;
  price?: string;
};
export type CurrentCustomer = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  wishlist: WishlistItem[];
  activeCartId: string | null;
};

export function customerCartSyncEnabled() {
  return process.env.ENABLE_CUSTOMER_CART_SYNC === "true";
}

function customerAccessIsUnavailable(error: unknown) {
  return error instanceof Error && error.message.includes("not approved to access the Customer object");
}
type CustomerWithWishlist = Omit<CurrentCustomer, "wishlist"> & {
  wishlist: { value: string | null } | null;
  activeCart: { value: string | null } | null;
};

type CustomerPayload = {
  customer: { id: string } | null;
  customerUserErrors: Array<{ field: string[]; message: string }>;
};

export async function createCustomer(input: {
  email: string;
  password: string;
  firstName?: string;
}) {
  const data = await storefrontRequest<
    { customerCreate: CustomerPayload },
    { input: { email: string; password: string; firstName?: string } }
  >(
    `
    mutation CustomerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) { customer { id } customerUserErrors { field message } }
    }
  `,
    { input },
  );
  return data.customerCreate;
}

export async function getCurrentCustomer(accessToken: string) {
  const data = await storefrontRequest<
    { customer: CustomerWithWishlist | null },
    { customerAccessToken: string }
  >(
    `
    query CurrentCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        email
        firstName
        lastName
        wishlist: metafield(namespace: "custom", key: "wishlist") { value }
        activeCart: metafield(namespace: "custom", key: "active_cart_id") { value }
      }
    }
  `,
    { customerAccessToken: accessToken },
    { cache: "no-store" },
  );
  if (!data.customer) return null;
  let wishlist: WishlistItem[] = [];
  try {
    wishlist = JSON.parse(data.customer.wishlist?.value ?? "[]") as WishlistItem[];
  } catch {
    /* Invalid CMS data is treated as empty. */
  }
  return {
    ...data.customer,
    wishlist,
    activeCartId: data.customer.activeCart?.value ?? null,
  };
}

export async function updateCustomerWishlist(
  customerAccessToken: string,
  wishlist: WishlistItem[],
) {
  const customer = await getCurrentCustomer(customerAccessToken);
  if (!customer)
    return { customerUserErrors: [{ field: [], message: "Customer session expired." }] };
  const data = await adminRequest<{
    customerUpdate: { userErrors: Array<{ field: string[]; message: string }> };
  }>(
    `mutation WishlistUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) { userErrors { field message } }
    }`,
    {
      input: {
        id: customer.id,
        metafields: [{ namespace: "custom", key: "wishlist", type: "json", value: JSON.stringify(wishlist) }],
      },
    },
  );
  return { customerUserErrors: data.customerUpdate.userErrors };
}

export async function getCustomerActiveCartId(accessToken: string) {
  try {
    const customer = await getCurrentCustomer(accessToken);
    return customer?.activeCartId ?? null;
  } catch (error) {
    if (customerAccessIsUnavailable(error)) return null;
    throw error;
  }
}

export async function saveCustomerActiveCartId(accessToken: string, cartId: string) {
  try {
    const customer = await getCurrentCustomer(accessToken).catch(() => null);
    const customerId = customer?.id ?? (await getCustomerAccountIdentity(accessToken).catch(() => null))?.id;
    if (!customerId) return;
    const data = await adminRequest<{
      customerUpdate: { userErrors: Array<{ field: string[]; message: string }> };
    }>(
      `mutation SaveActiveCart($input: CustomerInput!) {
        customerUpdate(input: $input) { userErrors { field message } }
      }`,
      {
        input: {
          id: customerId,
          metafields: [{ namespace: "custom", key: "active_cart_id", type: "single_line_text_field", value: cartId }],
        },
      },
    );
    const userError = data.customerUpdate.userErrors[0];
    if (userError) throw new Error(`Unable to save customer active cart: ${userError.message}`);
  } catch (error) {
    if (customerAccessIsUnavailable(error)) return;
    throw error;
  }
}

export async function createCustomerAccessToken(input: { email: string; password: string }) {
  const data = await storefrontRequest<
    {
      customerAccessTokenCreate: {
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
        customerUserErrors: Array<{ field: string[]; message: string }>;
      };
    },
    { input: { email: string; password: string } }
  >(
    `
    mutation CustomerLogin($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message }
      }
    }
  `,
    { input },
  );
  return data.customerAccessTokenCreate;
}
