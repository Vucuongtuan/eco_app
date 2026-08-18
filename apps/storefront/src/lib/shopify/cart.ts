import "server-only";
import { storefrontRequest, throwOnUserErrors } from "./client";
import { CART_FRAGMENT, IMAGE_FRAGMENT, MONEY_FRAGMENT, PRODUCT_VARIANT_FRAGMENT } from "./fragments";
import type { Cart, CartLineInput, CartLineUpdateInput, UserError } from "./types";

const CART_FRAGMENTS = `${IMAGE_FRAGMENT}\n${MONEY_FRAGMENT}\n${PRODUCT_VARIANT_FRAGMENT}\n${CART_FRAGMENT}`;

const CART_QUERY = `
  ${CART_FRAGMENTS}
  query Cart($id: ID!) { cart(id: $id) { ...CartFields } }
`;

const CART_CREATE = `
  ${CART_FRAGMENTS}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) { cart { ...CartFields } userErrors { field message code } }
  }
`;

const CART_LINES_ADD = `
  ${CART_FRAGMENTS}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message code } }
  }
`;

const CART_LINES_UPDATE = `
  ${CART_FRAGMENTS}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message code } }
  }
`;

const CART_LINES_REMOVE = `
  ${CART_FRAGMENTS}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message code } }
  }
`;

type CartPayload = { cart: Cart | null; userErrors: UserError[] };

function cartFrom(operation: string, payload: CartPayload) {
  throwOnUserErrors(operation, payload.userErrors);
  if (!payload.cart) throw new Error(`${operation} returned no cart`);
  return payload.cart;
}

export async function getCart(id: string) {
  const data = await storefrontRequest<{ cart: Cart | null }, { id: string }>(
    CART_QUERY, { id }, { cache: "no-store" },
  );
  return data.cart;
}

export async function createCart(lines: CartLineInput[] = []) {
  const data = await storefrontRequest<{ cartCreate: CartPayload }, { input: { lines: CartLineInput[] } }>(
    CART_CREATE, { input: { lines } }, { cache: "no-store" },
  );
  return cartFrom("cartCreate", data.cartCreate);
}

export async function addCartLines(cartId: string, lines: CartLineInput[]) {
  const data = await storefrontRequest<{ cartLinesAdd: CartPayload }, { cartId: string; lines: CartLineInput[] }>(
    CART_LINES_ADD, { cartId, lines }, { cache: "no-store" },
  );
  return cartFrom("cartLinesAdd", data.cartLinesAdd);
}

export async function updateCartLines(cartId: string, lines: CartLineUpdateInput[]) {
  const data = await storefrontRequest<{ cartLinesUpdate: CartPayload }, { cartId: string; lines: CartLineUpdateInput[] }>(
    CART_LINES_UPDATE, { cartId, lines }, { cache: "no-store" },
  );
  return cartFrom("cartLinesUpdate", data.cartLinesUpdate);
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  const data = await storefrontRequest<{ cartLinesRemove: CartPayload }, { cartId: string; lineIds: string[] }>(
    CART_LINES_REMOVE, { cartId, lineIds }, { cache: "no-store" },
  );
  return cartFrom("cartLinesRemove", data.cartLinesRemove);
}

