import { cacheFunc } from "@/lib/cacheFunc";
import { query } from "@/lib/tryCatch";
import { Post } from "@/payload-types";
import { Lang, ResponseDocs } from "@/types";
import { PaginatedDocs } from "payload";

var LIMIT = 20;

export const findPostDoc = async (): Promise<Post[] | Error> => {
  return cacheFunc(
    async () => {
      const [vi, en] = await Promise.all([
        query<ResponseDocs<Post>>((payload) => {
          return payload.find({
            collection: "posts",
            limit: LIMIT,
            locale: "vi",
            soft: "-publishAt",
            select: {
              slug: true,
            },
            where: {},
          });
        }),
        query<ResponseDocs<Post>>((payload) => {
          return payload.find({
            collection: "posts",
            limit: LIMIT,
            locale: "en",
            soft: "-publishAt",
            select: {
              slug: true,
            },
            where: {},
          });
        }),
      ]);

      const [viDoc, viErr] = vi;
      if (viErr) throw viErr;

      const [enDoc, enErr] = en;
      if (enErr) throw enErr;

      return [...viDoc.docs, ...enDoc.docs];

      //   if () throw err;
      //   return result.docs as Post[];
    },
    [`post-static`],
    {
      tags: [`post-static`],
    }
  )();
};


export const findPostBySlug = async ({slug,lang}: {slug:string,lang:Lang}) => {
    return cacheFunc(
        async () => {
          const [result,err] = await query<PaginatedDocs<Post>>((payload) => {
            return payload.find({
                collection: "posts",
                locale: lang,
                where: {
                    slug: {
                        equals: slug,
                    },
                },
                limit:1
            });
          });
          if (err) throw err;
          return result.docs[0] as Post;
        },
        [`post-${slug}-${lang}`],
        {
            tags: [`post-${slug}-${lang}`],
        }
    )();
}