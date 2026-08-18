import "server-only";
import { storefrontRequest } from "./client";
import type { MenuResponse, MenuVariables } from "./types";

const MENU_QUERY = `
  query StorefrontMenu($handle: String!) {
    menu(handle: $handle) {
      id
      title
      handle
      itemsCount
      items {
        id
        title
        type
        url
        resourceId
        tags
        items {
          id
          title
          type
          url
          resourceId
          tags
          items {
            id
            title
            type
            url
            resourceId
            tags
          }
        }
      }
    }
  }
`;

export async function getMenu(handle: string) {
  const data = await storefrontRequest<MenuResponse, MenuVariables>(
    MENU_QUERY,
    { handle },
    { cache: "force-cache" },
  );
  return data.menu;
}
