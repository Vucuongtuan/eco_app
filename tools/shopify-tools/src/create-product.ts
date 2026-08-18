import { shopifyAdminGraphql } from "./client.ts";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const titleIndex = args.indexOf("--title");
const title = titleIndex >= 0 ? args[titleIndex + 1] : "Moon Co. Phase 1 Test Product";
if (!title || title.startsWith("--")) throw new Error("--title requires a value");

const input = { title, status: "DRAFT" };
if (dryRun) {
  console.log(JSON.stringify({ operation: "productCreate", input }, null, 2));
  process.exit(0);
}

type CreateResult = {
  productCreate: {
    product: { id: string; title: string; status: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

const data = await shopifyAdminGraphql<CreateResult>(`
  mutation PhaseOneCreateProduct($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product { id title status }
      userErrors { field message }
    }
  }
`, { product: input });

if (data.productCreate.userErrors.length) {
  throw new Error(`Product validation failed: ${JSON.stringify(data.productCreate.userErrors)}`);
}
console.log(JSON.stringify(data.productCreate.product, null, 2));
