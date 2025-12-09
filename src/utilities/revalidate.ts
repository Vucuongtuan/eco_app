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
      revalidateTag(collection);
      console.log(`Revalidated tag: ${collection}`);
    } catch (e) {
      console.error(`Error revalidating tag ${collection}:`, e);
    }
  }
};
