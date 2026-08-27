import { connection } from "next/server";
import { AccountPanel } from "@/components/Account/AccountPanel";
import { ProfilePanel } from "@/components/Account/ProfilePanel";
import { getAccountVisuals } from "@/services/actions";
import { getCurrentCustomerAction } from "@/services/actions";

export const instant = false; // block prerendering — requires live request (Next.js 16 cacheComponents)

export default async function AccountPage() {
  await connection(); // opt out of prerendering — requires live request
  const customer = await getCurrentCustomerAction();
  if (customer) return <ProfilePanel customer={customer} />;
  const visuals = await getAccountVisuals();
  return <AccountPanel visuals={visuals} />;
}
