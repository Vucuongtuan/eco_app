import { connection } from "next/server";
import { AccountPanel } from "@/components/Account/AccountPanel";
import { ProfilePanel } from "@/components/Account/ProfilePanel";
import { getAccountVisuals } from "@/services/actions";
import { getCurrentCustomerAction } from "@/services/actions";

export const instant = false;

export default async function AccountPage() {
  "use memo";
  await connection();
  const customer = await getCurrentCustomerAction();
  if (customer) return <ProfilePanel customer={customer} />;
  const visuals = await getAccountVisuals();
  return <AccountPanel visuals={visuals} />;
}
