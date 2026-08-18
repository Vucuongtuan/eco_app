import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("shopify_customer_access_token");
  cookieStore.delete("shopify_customer_refresh_token");
  redirect("/");
}
