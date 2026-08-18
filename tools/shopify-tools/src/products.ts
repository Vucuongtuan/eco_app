import { shopifyAdminGraphql } from "./client.ts";

type ProductsResult = {
  products: {
    nodes: Array<{ id: string; title: string; handle: string; status: string }>;
  };
};

const data = await shopifyAdminGraphql<ProductsResult>(`
  query PhaseOneProducts($first: Int!) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes { id title handle status }
    }
  }
`, { first: 10 });

console.log(JSON.stringify(data.products.nodes, null, 2));
