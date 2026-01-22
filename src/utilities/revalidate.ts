import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Revalidates Next.js cache for a given path and/or collection tag.
 * @param {object} options - The revalidation options.
 * @param {string} [options.path] - The specific path to revalidate (e.g., '/products/my-cool-product').
 * @param {string} [options.collection] - The collection slug to use as a revalidation tag (e.g., 'products').
 */
export const revalidate = async ({
  path,
  collection,
}: {
  path?: string;
  collection?: string;
}) => {
  if (path) {
    try {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    } catch (e) {
      console.error(`Error revalidating path ${path}:`, e);
    }
  }

  if (collection) {
    try {
      revalidateTag(collection, "max");
      console.log(`Revalidated tag: ${collection}`);
    } catch (e) {
      console.error(`Error revalidating tag ${collection}:`, e);
    }
  }
};
export async function rv({
  paths = [],
  tags = [],
}: {
  paths?: string[];
  tags?: string[];
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const url = `${SITE_URL}/api/revalidate`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.REVALIDATE_SECRET!}`,
      },
      body: JSON.stringify({ paths, tags }),
    });
  } catch (error) {
    console.error("Revalidate error:", (error as Error).message);
  }
}
