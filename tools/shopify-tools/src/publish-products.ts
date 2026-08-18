import { shopifyAdminGraphql } from "./client.ts";

type Publication = { id: string; name: string };
type Product = { id: string; title: string; handle: string; status: string };

type ProductResponse = { products: { nodes: Product[] } };
type PublicationResponse = { publications: { nodes: Publication[] } };
type CollectionResponse = { collections: { nodes: Array<{ id: string; title: string; handle: string }> } };
type PublishResponse = {
  publishablePublish: {
    userErrors: Array<{ field: string[]; message: string }>;
  };
};

const args = new Set(process.argv.slice(2));
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : 250;
const collectionHandle = process.argv.find((arg) => arg.startsWith("--collection="))?.slice("--collection=".length);
const confirm = args.has("--confirm");

if (!Number.isInteger(limit) || limit < 1 || limit > 250) {
  throw new Error("--limit must be an integer between 1 and 250");
}

const publicationData = await shopifyAdminGraphql<PublicationResponse>(`
  query OnlineStorePublication {
    publications(first: 50) { nodes { id name } }
  }
`);
const publication = publicationData.publications.nodes.find((item) => item.name === "Online Store");
if (!publication) throw new Error("Online Store publication was not found");

const productsData = await shopifyAdminGraphql<ProductResponse>(`
  query ActiveProducts($first: Int!) {
    products(first: $first, query: "status:active", sortKey: UPDATED_AT) {
      nodes { id title handle status }
    }
  }
`, { first: limit });

const targets: Array<{ id: string; label: string }> = productsData.products.nodes.map((product) => ({
  id: product.id,
  label: `product ${product.title} (${product.handle})`,
}));

if (collectionHandle) {
  const collectionData = await shopifyAdminGraphql<CollectionResponse>(`
    query CollectionByHandle($query: String!) {
      collections(first: 1, query: $query) { nodes { id title handle } }
    }
  `, { query: `handle:${collectionHandle}` });
  const collection = collectionData.collections.nodes[0];
  if (!collection || collection.handle !== collectionHandle) throw new Error(`Collection not found: ${collectionHandle}`);
  targets.unshift({ id: collection.id, label: `collection ${collection.title} (${collectionHandle})` });
}

console.log(`${confirm ? "Publishing" : "Dry run"} ${targets.length} item(s) to ${publication.name}`);
if (!confirm) {
  for (const target of targets) console.log(`- ${target.label}`);
  console.log("Run again with --confirm to publish.");
  process.exit(0);
}

for (const target of targets) {
  const result = await shopifyAdminGraphql<PublishResponse>(`
    mutation PublishItem($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }
  `, { id: target.id, input: [{ publicationId: publication.id }] });
  const errors = result.publishablePublish.userErrors;
  if (errors.length) console.error(`FAILED ${target.label}: ${errors.map((error) => error.message).join("; ")}`);
  else console.log(`OK ${target.label}`);
}
