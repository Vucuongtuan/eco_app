import { getPayloadInstance } from "@/lib/tryCatch";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("payload-token");

  if (!token) {
    return redirect("/login");
  }

  try {
    const payload = await getPayloadInstance();
    const user = await payload.auth.me({
      collection: "users",
      req: { headers: { authorization: `Bearer ${token.value}` } },
    });

    if (user?.user) {
      return redirect("/");
    }
  } catch (error) {
    // Token invalid
  }

  return redirect("/login");
}
