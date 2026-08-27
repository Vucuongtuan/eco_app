import "server-only";
import { storefrontRequest } from "./client";

const BLOGS_QUERY = `
  query Blogs($first: Int!, $after: String) {
    blogs(first: $first, after: $after) {
      nodes {
        id
        handle
        title
        seo {
          title
          description
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const BLOG_QUERY = `
  query Blog($handle: String!, $first: Int!, $after: String) {
    blog(handle: $handle) {
      id
      handle
      title
      seo {
        title
        description
      }
      articles(first: $first, after: $after) {
        nodes {
          id
          handle
          title
          excerpt
          contentHtml
          publishedAt
          tags
          authorV2 {
            name
          }
          image {
            url
            altText
            width
            height
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const ARTICLE_QUERY = `
  query Article($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      id
      handle
      title
      articleByHandle(handle: $articleHandle) {
        id
        handle
        title
        excerpt
        contentHtml
        publishedAt
        tags
        authorV2 {
          name
        }
        image {
          url
          altText
          width
          height
        }
        seo {
          title
          description
        }
      }
    }
  }
`;

export type Article = {
  id: string;
  handle: string;
  title: string;
  excerpt?: string | null;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  authorV2?: { name: string } | null;
  image?: { url: string; altText: string | null; width: number | null; height: number | null } | null;
  seo?: { title?: string; description?: string } | null;
};

export type BlogData = {
  id: string;
  handle: string;
  title: string;
  seo?: { title?: string; description?: string } | null;
  articles?: {
    nodes: Article[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export async function getBlogs(first = 10, after?: string) {
  const data = await storefrontRequest<{ blogs: { nodes: BlogData[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } }, Record<string, unknown>>(
    BLOGS_QUERY,
    { first, after },
    { tags: ["shopify-blogs"] }
  );
  return data.blogs;
}

export async function getBlog(handle: string, first = 12, after?: string) {
  const data = await storefrontRequest<{ blog: BlogData | null }, Record<string, unknown>>(
    BLOG_QUERY,
    { handle, first, after },
    { tags: ["shopify-blogs", `shopify-blog:${handle}`] }
  );
  return data.blog;
}

export async function getArticle(blogHandle: string, articleHandle: string) {
  const data = await storefrontRequest<{ blog: { id: string; handle: string; title: string; articleByHandle: Article | null } | null }, Record<string, unknown>>(
    ARTICLE_QUERY,
    { blogHandle, articleHandle },
    { tags: ["shopify-blogs", `shopify-blog:${blogHandle}`, `shopify-article:${articleHandle}`] }
  );
  return data.blog?.articleByHandle ?? null;
}
