import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { exchangeCustomerCode } from "@/lib/shopify/customer-account";
import { customerCartSyncEnabled, getCustomerActiveCartId, saveCustomerActiveCartId } from "@/lib/shopify/customers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const cookieStore = await cookies();
  const savedState = cookieStore.get("shopify_customer_oauth_state")?.value;
  if (!state || !code || !savedState || state !== savedState)
    redirect("/account?error=invalid_oauth_state");
  const tokens = await exchangeCustomerCode(code);
  cookieStore.delete("shopify_customer_oauth_state");
  cookieStore.set("shopify_customer_access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in ?? 3600,
  });
  if (tokens.refresh_token)
    cookieStore.set("shopify_customer_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
  });
  const cartId = cookieStore.get("shopify_cart_id")?.value;
  if (customerCartSyncEnabled()) {
    const customerCartId = await getCustomerActiveCartId(tokens.access_token);
    const activeCartId = customerCartId ?? cartId;
    if (activeCartId) {
      if (!customerCartId) await saveCustomerActiveCartId(tokens.access_token, activeCartId);
      cookieStore.set("shopify_cart_id", activeCartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }
  redirect("/account");
}
