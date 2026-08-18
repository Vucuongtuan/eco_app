import "server-only";
import { storefrontRequest } from "./client";
export type CurrentCustomer = { id: string; email: string | null; firstName: string | null; lastName: string | null };

type CustomerPayload = { customer: { id: string } | null; customerUserErrors: Array<{ field: string[]; message: string }> };

export async function createCustomer(input: { email: string; password: string; firstName?: string }) {
  const data = await storefrontRequest<{ customerCreate: CustomerPayload }, { input: { email: string; password: string; firstName?: string } }>(`
    mutation CustomerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) { customer { id } customerUserErrors { field message } }
    }
  `, { input });
  return data.customerCreate;
}

export async function getCurrentCustomer(accessToken: string) {
  const data = await storefrontRequest<{ customer: CurrentCustomer | null }, { customerAccessToken: string }>(`
    query CurrentCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) { id email firstName lastName }
    }
  `, { customerAccessToken: accessToken }, { cache: "no-store" });
  return data.customer;
}

export async function createCustomerAccessToken(input: { email: string; password: string }) {
  const data = await storefrontRequest<{ customerAccessTokenCreate: { customerAccessToken: { accessToken: string; expiresAt: string } | null; customerUserErrors: Array<{ field: string[]; message: string }> } }, { input: { email: string; password: string } }>(`
    mutation CustomerLogin($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { field message }
      }
    }
  `, { input });
  return data.customerAccessTokenCreate;
}
