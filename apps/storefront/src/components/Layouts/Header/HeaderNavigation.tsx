import { getCollectionsAction, getMainMenuAction } from "@/services/actions";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";
import { getCustomer } from "./data";
import { getCollectionHandle, isNewInItem } from "./menu-utils";

export default async function HeaderNavigation() {
  const [navData, collections, customer] = await Promise.all([
    getMainMenuAction(),
    getCollectionsAction(100),
    getCustomer(),
  ]);

  const nav = navData?.items ?? [];

  // Chỉ gửi xuống client ảnh của các collection "New in" thực sự được dùng.
  const newInHandles = new Set(
    nav
      .flatMap((item) => item.items ?? [])
      .filter(isNewInItem)
      .map((item) => getCollectionHandle(item.url))
      .filter((handle): handle is string => Boolean(handle)),
  );

  const collectionImages = Object.fromEntries(
    collections.nodes
      .filter((collection) => newInHandles.has(collection.handle) && collection.image?.url)
      .map((collection) => [collection.handle, collection.image!.url]),
  );

  // Fragment: hai phần tử này là grid item trực tiếp của header.
  return (
    <>
      <MobileMenu nav={nav} authenticated={Boolean(customer)} customer={customer} />
      <Navigation nav={nav} collectionImages={collectionImages} />
    </>
  );
}
