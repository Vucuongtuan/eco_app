import { unstable_cache } from "next/cache";

const isDev = process.env.NODE_ENV === "development";

export function cacheFunc<T>(
  fn: () => Promise<T>,
  key: string[],
  options?: Parameters<typeof unstable_cache>[2]
): () => Promise<T> {
  // return isDev ? fn : unstable_cache(fn, key, options);
  return unstable_cache(fn, key, options);
}
