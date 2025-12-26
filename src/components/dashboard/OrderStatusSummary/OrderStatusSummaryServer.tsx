import { findOrderStatus } from "@/service/dashboard";
import { OrderStatusSummaryClient } from "./OrderStatusSummaryClient";

export async function OrderStatusSummaryServer() {
  const docs = await findOrderStatus({ soft: "" });

  if (!docs || !docs.docs) {
    return null;
  }
  return <OrderStatusSummaryClient orders={docs.docs} />;
}
