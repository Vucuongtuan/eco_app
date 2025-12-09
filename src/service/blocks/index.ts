import { cacheFunc } from "@/lib/cacheFunc";
import { query } from "@/lib/tryCatch";
import { Category, Product, Tag } from "@/payload-types";
import { Lang, ResponseDocs } from "@/types";
import { PaginatedDocs } from "payload";

/*
 * Block Service CategoryShowcase
 * @param id category
 * @returns Product[]
 *
 */
type FindCategoryShowcase = (
  id: string,
  categoryId: number
) => Promise<Product[]>;
export const findCategoryShowcase: FindCategoryShowcase = async (
  id,
  categoryId
) => {
  return cacheFunc(
    async () => {
      const [result, err] = await query<ResponseDocs<Product>>((payload) => {
        return payload.find({
          collection: "products",
          where: {
            "taxonomies.category": {
              equals: categoryId,
            },
            status: "published",
          },
          limit: 4,
        });
      });
      if (err) throw err;
      return result.docs as Product[];
    },
    [`categoryShowcase-${id}`],
    {
      tags: [`categoryShowcase-${id}`],
    }
  )();
};

export interface FindProductByType {
  type: "categories" | "tags";
  categories?: Category | string;
  tags?: Tag[] | string[];
  options?: {
    limit: number;
    page: number;
  };
  lang: Lang;
}

export const findProductListByType = async ({
  type,
  categories,
  tags,
  options,
  lang

}: FindProductByType) => {
  const tag =  type === 'categories' ? (categories as Category).slug || categories : 'tags'
  return cacheFunc(
    async () => {

      let where: Record<string, any> = {};

      if (type === "categories" && categories ) {
        let categoryIds: string;
        if (typeof categories !== 'string') {
          categoryIds = categories.id;
        } else {
          categoryIds = categories;
        }
        
        where = {
          or: [
            {
              "taxonomies.category": {
                equals: categoryIds,
              },
            },
          ],
          _status: {
            equals: "published",
          },
        };
      }
      if (type === "tags" && tags && tags.length > 0) {
        let tagIds: string[] = [];
        if (typeof tags[0] !== 'string') {
          // @ts-expect-error
          tagIds = tags.map((tag) => tag.id);
        } else {
          // @ts-expect-error
          tagIds = tags;
        }
        where = {
          "taxonomies.tags": {
            in: tagIds,
          },
         _status: {
              equals: "published",
            },
        };
      }
      const [result, err] = await query<PaginatedDocs<Product>>((payload) => {
        return payload.find({
          collection: "products",
          where,
          limit: options?.limit || 16,
          page: options?.page || 1,
          sort: "-publishedAt",
          locale: lang,
        });;
      });
      if (err) throw err;
      return result.docs as Product[];
    },
    [`blockListProduct-${lang}-${type}-${tag}`],
    {
      tags: [`blockListProduct-${lang}-${type}-${tag}`],
    }
  )();
};
