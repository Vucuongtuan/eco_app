import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { customerAuthorizationUrl } from "@/lib/shopify/customer-account";

export async function GET(request: Request) {
  const mode = new URL(request.url).searchParams.get("mode") === "register" ? "register" : "login";
  const state = randomUUID();
  (await cookies()).set("shopify_customer_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  redirect(await customerAuthorizationUrl(state, mode));
}
