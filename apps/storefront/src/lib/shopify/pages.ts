import "server-only";
import { storefrontRequest } from "./client";

const PAGE_QUERY = `
  query Page($handle: String!) {
    page(handle: $handle) {
      id
      handle
      title
      body
      bodySummary
      createdAt
      updatedAt
      seo {
        title
        description
      }
    }
  }
`;

const PAGES_QUERY = `
  query Pages {
    pages(first: 50) {
      nodes {
        id
        handle
        title
      }
    }
  }
`;

export type PageData = {
  id: string;
  handle: string;
  title: string;
  body: string;
  bodySummary: string;
  createdAt: string;
  updatedAt: string;
  seo?: {
    title?: string;
    description?: string;
  };
};

export async function getPage(handle: string) {
  const data = await storefrontRequest<{ page: PageData | null }, { handle: string }>(
    PAGE_QUERY,
    { handle },
    { tags: ["shopify-pages", `shopify-page:${handle}`] }
  );
  return data.page;
}

export async function getPages() {
  const data = await storefrontRequest<{ pages: { nodes: Pick<PageData, "id" | "handle" | "title">[] } }, Record<string, never>>(
    PAGES_QUERY,
    {},
    { tags: ["shopify-pages"] }
  );
  return data.pages?.nodes ?? [];
}
