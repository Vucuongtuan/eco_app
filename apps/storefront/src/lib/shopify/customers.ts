import "server-only";
import { storefrontRequest } from "./client";
import { adminRequest } from "./admin";
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
};
type CustomerWithWishlist = Omit<CurrentCustomer, "wishlist"> & {
  wishlist: { value: string | null } | null;
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
      customer(customerAccessToken: $customerAccessToken) { id email firstName lastName wishlist: metafield(namespace: "custom", key: "wishlist") { value } }
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
  return { ...data.customer, wishlist };
}

export async function updateCustomerWishlist(
  customerAccessToken: string,
  wishlist: WishlistItem[],
) {
  const customer = await getCurrentCustomer(customerAccessToken);
  if (!customer)
    return { customerUserErrors: [{ field: [], message: "Customer session expired." }] };
  const data = await adminRequest<{
    metafieldsSet: { userErrors: Array<{ field: string[]; message: string }> };
  }>(
    `
    mutation WishlistMetafieldSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { userErrors { field message } }
    }
  `,
    {
      metafields: [
        {
          ownerId: customer.id,
          namespace: "custom",
          key: "wishlist",
          type: "json",
          value: JSON.stringify(wishlist),
        },
      ],
    },
  );
  return { customerUserErrors: data.metafieldsSet.userErrors };
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
