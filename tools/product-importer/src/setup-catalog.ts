import { adminGraphql } from "./shopify.ts";

type Rule = { column: "TAG"; relation: "EQUALS"; condition: string };
type Definition = { title: string; handle: string; rules: Rule[] };

const tag = (condition: string): Rule => ({ column: "TAG", relation: "EQUALS", condition });

const collections: Definition[] = [
  { title: "Men", handle: "men", rules: [tag("gender:men")] },
  { title: "Men New In", handle: "men-new-in", rules: [tag("collection:men-new-in")] },
  { title: "Men Tops", handle: "men-tops", rules: [tag("gender:men"), tag("department:tops")] },
  { title: "Men Bottoms", handle: "men-bottoms", rules: [tag("gender:men"), tag("department:bottoms")] },
  { title: "Men T-Shirts", handle: "men-t-shirts", rules: [tag("gender:men"), tag("product-type:t-shirt")] },
  { title: "Men Shirts", handle: "men-shirts", rules: [tag("gender:men"), tag("product-type:shirt")] },
  { title: "Men Trousers", handle: "men-trousers", rules: [tag("gender:men"), tag("product-type:trousers")] },
  { title: "Men Shorts", handle: "men-shorts", rules: [tag("gender:men"), tag("product-type:shorts")] },
  { title: "Women", handle: "women", rules: [tag("gender:women")] },
  { title: "Women New In", handle: "women-new-in", rules: [tag("collection:women-new-in")] },
  { title: "Women Dresses", handle: "women-dresses", rules: [tag("gender:women"), tag("product-type:dress")] },
  { title: "Women Tops", handle: "women-tops", rules: [tag("gender:women"), tag("department:tops")] },
  { title: "Women Bottoms", handle: "women-bottoms", rules: [tag("gender:women"), tag("department:bottoms")] },
  { title: "Women T-Shirts", handle: "women-t-shirts", rules: [tag("gender:women"), tag("product-type:t-shirt")] },
  { title: "Women Blouses", handle: "women-blouses", rules: [tag("gender:women"), tag("product-type:blouse")] },
  { title: "Women Trousers", handle: "women-trousers", rules: [tag("gender:women"), tag("product-type:trousers")] },
  { title: "Women Skirts", handle: "women-skirts", rules: [tag("gender:women"), tag("product-type:skirt")] },
  { title: "Women Shorts", handle: "women-shorts", rules: [tag("gender:women"), tag("product-type:shorts")] },
  { title: "Women Jumpsuits", handle: "women-jumpsuits", rules: [tag("gender:women"), tag("product-type:jumpsuit")] },
  { title: "Kids", handle: "kids", rules: [tag("gender:kids")] },
  { title: "Kids New In", handle: "kids-new-in", rules: [tag("collection:kids-new-in")] },
  { title: "Kids T-Shirts", handle: "kids-t-shirts", rules: [tag("gender:kids"), tag("product-type:t-shirt")] },
  { title: "Kids Tops", handle: "kids-tops", rules: [tag("gender:kids"), tag("department:tops")] },
  { title: "Kids Bottoms", handle: "kids-bottoms", rules: [tag("gender:kids"), tag("department:bottoms")] },
  { title: "Kids Trousers", handle: "kids-trousers", rules: [tag("gender:kids"), tag("product-type:trousers")] },
  { title: "Kids Dresses", handle: "kids-dresses", rules: [tag("gender:kids"), tag("product-type:dress")] },
  { title: "Kids Shorts", handle: "kids-shorts", rules: [tag("gender:kids"), tag("product-type:shorts")] },
  { title: "Accessories", handle: "accessories", rules: [tag("collection:accessories")] },
  { title: "Bags", handle: "bags", rules: [tag("collection:accessories"), tag("product-type:bag")] },
  { title: "Hats", handle: "hats", rules: [tag("collection:accessories"), tag("product-type:hat")] },
  { title: "Scarves", handle: "scarves", rules: [tag("collection:accessories"), tag("product-type:scarf")] },
  { title: "Other Accessories", handle: "other-accessories", rules: [tag("collection:accessories"), tag("product-type:accessory")] },
];

const stateQuery = `
  query CatalogSetupState {
    currentAppInstallation { accessScopes { handle } }
    collections(first: 100) { nodes { id title handle } }
  }
`;

const menusQuery = `query CatalogMenus { menus(first: 50) { nodes { id title handle } } }`;
const publicationsQuery = `query CatalogPublications { publications(first: 50) { nodes { id name } } }`;

const createMutation = `
  mutation CreateAutomatedCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

const updateMutation = `
  mutation UpdateAutomatedCollection($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

const publishMutation = `
  mutation PublishCollection($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

const menuCreateMutation = `
  mutation CreateMenu($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu { id title handle }
      userErrors { field message }
    }
  }
`;

const menuUpdateMutation = `
  mutation UpdateMenu($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu { id title handle }
      userErrors { field message }
    }
  }
`;

type State = {
  currentAppInstallation: { accessScopes: Array<{ handle: string }> };
  collections: { nodes: Array<{ id: string; title: string; handle: string }> };
};

type MutationResult<K extends string> = Record<K, {
  collection?: { id: string; title: string; handle: string } | null;
  menu?: { id: string; title: string; handle: string } | null;
  userErrors: Array<{ field: string[]; message: string }>;
}>;

function assertSuccess(operation: string, errors: Array<{ message: string }>) {
  if (errors.length) throw new Error(`${operation}: ${JSON.stringify(errors)}`);
}

function menuItem(title: string, collection: { id: string; handle: string }, items: unknown[] = []) {
  return {
    title,
    type: "COLLECTION",
    resourceId: collection.id,
    url: `/collections/${collection.handle}`,
    items,
  };
}

const apply = process.argv.includes("--apply");
const state = await adminGraphql<State>(stateQuery, {});
const scopes = new Set(state.currentAppInstallation.accessScopes.map(({ handle }) => handle));
const menus = scopes.has("read_online_store_navigation")
  ? (await adminGraphql<{ menus: { nodes: Array<{ id: string; title: string; handle: string }> } }>(menusQuery, {})).menus.nodes
  : [];
const publications = scopes.has("read_publications")
  ? (await adminGraphql<{ publications: { nodes: Array<{ id: string; name: string }> } }>(publicationsQuery, {})).publications.nodes
  : [];
console.log(`Scopes: ${[...scopes].sort().join(", ")}`);
console.log(`Existing: ${state.collections.nodes.length} collections, ${menus.length} readable menus`);

if (!scopes.has("write_products")) throw new Error("Missing write_products scope");
if (!apply) {
  console.log(JSON.stringify({
    mode: "preview",
    collections: collections.map(({ title, handle, rules }) => ({ title, handle, tags: rules.map(({ condition }) => condition) })),
    headlessPublication: publications.find(({ name }) => /headless/i.test(name)) ?? null,
    canWriteMenu: scopes.has("write_online_store_navigation"),
    canPublish: scopes.has("write_publications"),
  }, null, 2));
  process.exit(0);
}

const byHandle = new Map(state.collections.nodes.map((collection) => [collection.handle, collection]));
for (const definition of collections) {
  const existing = byHandle.get(definition.handle);
  const input = {
    ...(existing ? { id: existing.id } : {}),
    title: definition.title,
    handle: definition.handle,
    sortOrder: "CREATED_DESC",
    ruleSet: { appliedDisjunctively: false, rules: definition.rules },
  };
  if (existing) {
    const result = await adminGraphql<MutationResult<"collectionUpdate">>(updateMutation, { input });
    assertSuccess(`collectionUpdate(${definition.handle})`, result.collectionUpdate.userErrors);
    byHandle.set(definition.handle, result.collectionUpdate.collection!);
    console.log(`Updated collection: ${definition.handle}`);
  } else {
    const result = await adminGraphql<MutationResult<"collectionCreate">>(createMutation, { input });
    assertSuccess(`collectionCreate(${definition.handle})`, result.collectionCreate.userErrors);
    byHandle.set(definition.handle, result.collectionCreate.collection!);
    console.log(`Created collection: ${definition.handle}`);
  }
}

const headless = publications.find(({ name }) => /headless/i.test(name));
if (headless && scopes.has("write_publications")) {
  for (const definition of collections) {
    const collection = byHandle.get(definition.handle)!;
    const result = await adminGraphql<MutationResult<"publishablePublish">>(publishMutation, {
      id: collection.id,
      input: [{ publicationId: headless.id }],
    });
    assertSuccess(`publishablePublish(${definition.handle})`, result.publishablePublish.userErrors);
  }
  console.log(`Published ${collections.length} collections to ${headless.name}`);
} else {
  console.warn("Skipped Headless publication: Headless publication or write_publications scope unavailable");
}

const required = (handle: string) => {
  const collection = byHandle.get(handle);
  if (!collection) throw new Error(`Missing collection: ${handle}`);
  return collection;
};
const menuItems = [
  menuItem("MEN", required("men"), [
    menuItem("New In", required("men-new-in")),
    menuItem("Tops", required("men-tops"), [
      menuItem("T-Shirts", required("men-t-shirts")),
      menuItem("Shirts", required("men-shirts")),
    ]),
    menuItem("Bottoms", required("men-bottoms"), [
      menuItem("Trousers", required("men-trousers")),
      menuItem("Shorts", required("men-shorts")),
    ]),
  ]),
  menuItem("WOMEN", required("women"), [
    menuItem("New In", required("women-new-in")),
    menuItem("Tops", required("women-tops"), [
      menuItem("T-Shirts", required("women-t-shirts")), menuItem("Blouses", required("women-blouses")),
    ]),
    menuItem("Bottoms", required("women-bottoms"), [
      menuItem("Trousers", required("women-trousers")), menuItem("Skirts", required("women-skirts")),
      menuItem("Shorts", required("women-shorts")),
    ]),
    menuItem("One-piece", required("women-dresses"), [
      menuItem("Dresses", required("women-dresses")), menuItem("Jumpsuits", required("women-jumpsuits")),
    ]),
  ]),
  menuItem("KIDS", required("kids"), [
    menuItem("New In", required("kids-new-in")),
    menuItem("Tops", required("kids-tops"), [menuItem("T-Shirts", required("kids-t-shirts"))]),
    menuItem("Bottoms", required("kids-bottoms"), [
      menuItem("Trousers", required("kids-trousers")), menuItem("Shorts", required("kids-shorts")),
    ]),
    menuItem("Dresses", required("kids-dresses")),
  ]),
  menuItem("ACCESSORIES", required("accessories"), [
    menuItem("All Accessories", required("accessories")), menuItem("Bags", required("bags")),
    menuItem("Hats", required("hats")), menuItem("Scarves", required("scarves")),
    menuItem("Other", required("other-accessories")),
  ]),
];

if (scopes.has("write_online_store_navigation")) {
  const mainMenu = menus.find(({ handle }) => handle === "main-menu");
  if (mainMenu) {
    const result = await adminGraphql<MutationResult<"menuUpdate">>(menuUpdateMutation, {
      id: mainMenu.id, title: "Main menu", items: menuItems,
    });
    assertSuccess("menuUpdate(main-menu)", result.menuUpdate.userErrors);
    console.log("Updated menu: main-menu");
  } else {
    const result = await adminGraphql<MutationResult<"menuCreate">>(menuCreateMutation, {
      title: "Main menu", handle: "main-menu", items: menuItems,
    });
    assertSuccess("menuCreate(main-menu)", result.menuCreate.userErrors);
    console.log("Created menu: main-menu");
  }
} else {
  console.warn("Skipped main-menu: missing write_online_store_navigation scope");
}
