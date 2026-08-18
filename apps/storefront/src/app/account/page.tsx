import { AccountPanel } from "@/components/Account/AccountPanel";
import { ProfilePanel } from "@/components/Account/ProfilePanel";
import { getAccountVisuals } from "@/services/actions";
import { getCurrentCustomerAction } from "@/services/actions";

export default async function AccountPage() {
  const customer = await getCurrentCustomerAction();
  if (customer) return <ProfilePanel customer={customer} />;
  const visuals = await getAccountVisuals();
  return <AccountPanel visuals={visuals} />;
}
