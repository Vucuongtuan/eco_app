import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addCartLines, createCart, getCart, removeCartLines, updateCartLines } from "@/lib/shopify";
import {
  customerCartSyncEnabled,
  getCustomerActiveCartId,
  saveCustomerActiveCartId,
} from "@/lib/shopify/customers";

const CART_COOKIE = "shopify_cart_id";

function withCartCookie(response: NextResponse, cartId: string) {
  response.cookies.set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

async function getSessionCart(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const customerToken = cookieStore.get("shopify_customer_access_token")?.value;
  const customerCartId =
    customerToken && customerCartSyncEnabled()
      ? await getCustomerActiveCartId(customerToken)
      : null;

  return {
    customerToken,
    cartId: customerCartId ?? cookieStore.get(CART_COOKIE)?.value ?? null,
  };
}

async function saveActiveCart(customerToken: string | undefined, cartId: string) {
  if (customerToken && customerCartSyncEnabled()) {
    await saveCustomerActiveCartId(customerToken, cartId);
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const { cartId } = await getSessionCart(cookieStore);

  if (!cartId) return NextResponse.json({ cart: null });
  try {
    const cart = await getCart(cartId);
    if (!cart) {
      const response = NextResponse.json({ cart: null });
      response.cookies.delete(CART_COOKIE);
      return response;
    }
    return withCartCookie(NextResponse.json({ cart }), cart.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load cart." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  let body: { merchandiseId?: string; quantity?: number };
  try {
    body = (await request.json()) as { merchandiseId?: string; quantity?: number };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const quantity = body.quantity ?? 1;
  if (
    !body.merchandiseId?.startsWith("gid://shopify/ProductVariant/") ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  ) {
    return NextResponse.json({ error: "Invalid cart line." }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const { customerToken, cartId } = await getSessionCart(cookieStore);
    const existingCart = cartId ? await getCart(cartId) : null;
    const line = { merchandiseId: body.merchandiseId, quantity };
    const cart = existingCart
      ? await addCartLines(existingCart.id, [line])
      : await createCart([line]);
    await saveActiveCart(customerToken, cart.id);
    return withCartCookie(NextResponse.json({ cart }), cart.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to add item to cart." },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request) {
  let body: { lineId?: string; quantity?: number };
  try {
    body = (await request.json()) as { lineId?: string; quantity?: number };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    !body.lineId ||
    !Number.isInteger(body.quantity) ||
    body.quantity! < 0 ||
    body.quantity! > 100
  ) {
    return NextResponse.json({ error: "Invalid cart line update." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const { customerToken, cartId } = await getSessionCart(cookieStore);
  if (!cartId) return NextResponse.json({ error: "Cart not found." }, { status: 404 });

  try {
    const cart =
      body.quantity === 0
        ? await removeCartLines(cartId, [body.lineId])
        : await updateCartLines(cartId, [{ id: body.lineId, quantity: body.quantity }]);
    await saveActiveCart(customerToken, cart.id);
    return withCartCookie(NextResponse.json({ cart }), cart.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update cart." },
      { status: 502 },
    );
  }
}
