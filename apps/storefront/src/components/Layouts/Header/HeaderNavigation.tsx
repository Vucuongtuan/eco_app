import { getCollectionsAction, getCurrentCustomerAction, getMainMenuAction } from "@/services/actions";
import Navigation from "./Navigation";

export default async function HeaderNavigation() {
  const [navData, collections, customer] = await Promise.all([
    getMainMenuAction(),
    getCollectionsAction(100),
    getCurrentCustomerAction(),
  ]);

  const collectionImages = Object.fromEntries(
    collections.nodes
      .filter((collection) => collection.image?.url)
      .map((collection) => [collection.handle, collection.image!.url]),
  );

  return (
    <Navigation
      className="order-1 md:order-2"
      nav={navData?.items ?? []}
      collectionImages={collectionImages}
      authenticated={Boolean(customer)}
      customer={customer}
    />
  );
}
