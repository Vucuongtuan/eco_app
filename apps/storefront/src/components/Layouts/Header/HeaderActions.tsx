import { getTrendingProductsAction } from "@/services/actions";
import Actions from "./Actions";
import { getCustomer } from "./data";

export default async function HeaderActions() {
  const [trendingProducts, customer] = await Promise.all([
    getTrendingProductsAction(),
    getCustomer(),
  ]);

  return <Actions trendingProducts={trendingProducts} authenticated={Boolean(customer)} customer={customer} />;
}
