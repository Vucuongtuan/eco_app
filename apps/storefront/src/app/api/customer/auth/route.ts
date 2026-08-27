import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createCustomer, createCustomerAccessToken, customerCartSyncEnabled, getCustomerActiveCartId, saveCustomerActiveCartId } from "@/lib/shopify/customers";

export async function POST(request: Request) {
  const body = await request.json() as { mode?: "login" | "register"; email?: string; password?: string; firstName?: string };
  const email = body.email?.trim();
  const password = body.password ?? "";
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  if (body.mode === "register") {
    const created = await createCustomer({ email, password, firstName: body.firstName?.trim() });
    if (created.customerUserErrors.length) return NextResponse.json({ error: created.customerUserErrors[0].message }, { status: 400 });
  }

  const result = await createCustomerAccessToken({ email, password });
  if (!result.customerAccessToken) return NextResponse.json({ error: result.customerUserErrors[0]?.message ?? "Unable to sign in." }, { status: 401 });
  const cookieStore = await cookies();
  cookieStore.set("shopify_customer_access_token", result.customerAccessToken.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(result.customerAccessToken.expiresAt) });
  const cartId = cookieStore.get("shopify_cart_id")?.value;
  if (customerCartSyncEnabled()) {
    const customerCartId = await getCustomerActiveCartId(result.customerAccessToken.accessToken);
    const activeCartId = customerCartId ?? cartId;
    if (activeCartId) {
      if (!customerCartId) await saveCustomerActiveCartId(result.customerAccessToken.accessToken, activeCartId);
      cookieStore.set("shopify_cart_id", activeCartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
