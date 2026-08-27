import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getCurrentCustomer,
  updateCustomerWishlist,
  type WishlistItem,
} from "@/lib/shopify/customers";

async function customerToken() {
  return (await cookies()).get("shopify_customer_access_token")?.value;
}

export async function GET() {
  const token = await customerToken();
  if (!token) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    const customer = await getCurrentCustomer(token);
    if (!customer)
      return NextResponse.json({ error: "Customer session expired." }, { status: 401 });
    return NextResponse.json({ items: customer.wishlist });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load wishlist." },
      { status: 502 },
    );
  }
}

export async function PUT(request: Request) {
  const token = await customerToken();
  if (!token) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  let body: { items?: WishlistItem[] };
  try {
    body = (await request.json()) as { items?: WishlistItem[] };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length > 100)
    return NextResponse.json({ error: "Invalid wishlist." }, { status: 400 });
  try {
    const result = await updateCustomerWishlist(token, body.items);
    if (result.customerUserErrors.length) {
      const message = result.customerUserErrors[0].message;
      const status = message === "Customer session expired." ? 401 : 400;
      return NextResponse.json({ error: message }, { status });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save wishlist." },
      { status: 502 },
    );
  }
}
