import { getCurrentCustomerAction, getTrendingProductsAction } from "@/services/actions";
import Actions from "./Actions";

export default async function HeaderActions() {
  const [trendingProducts, customer] = await Promise.all([
    getTrendingProductsAction(),
    getCurrentCustomerAction(),
  ]);

  return <Actions trendingProducts={trendingProducts} authenticated={Boolean(customer)} customer={customer} />;
}
