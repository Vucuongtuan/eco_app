import { findOrderStatus } from "@/service/dashboard";
import { RevenueChartClient } from "./RevenueChartClient";

export async function RevenueChartServer() {
  const docs = await findOrderStatus({ soft: "-createdAt" });

  if (!docs || !docs.docs) {
    return null;
  }
  return <RevenueChartClient orders={docs.docs} />;
}
