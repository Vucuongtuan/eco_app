"use server";

import { query } from "@/lib/tryCatch";
import { Product, Rate } from "@/payload-types";
import { Lang, PaginationOption, ResponseDocs } from "@/types";
import { cookies } from "next/headers";

interface FindProductsByCategoryProps extends PaginationOption {
  lang: Lang;
  categoryId: string;
}

export const findProductsByCategory = async ({
  lang,
  limit = 10,
  page = 1,
  categoryId,
}: FindProductsByCategoryProps): Promise<ResponseDocs<Product>> => {
  const [result, err] = await query<ResponseDocs<Product>>((payload) => {
    return payload.find({
      collection: "products",
      where: {
        _status: {
          equals: "published",
        },
        category: {
          id: {
            equals: categoryId,
          },
        },
      },
      locale: lang,
      limit: limit,
      page: page,
      soft: "-publishAt",
    });
  });
  if (err) throw err;
  return result;
};

export const updateRateGlobal = async ({ rates }: { rates: Rate["rates"] }) => {
  if (!rates) return;
  const fetchRate = await fetch("https://api.fxratesapi.com/latest?base=VND");
  const dataRate = await fetchRate.json();
  const newRates = rates.map((rate) => {
    if (!rate.currency || !dataRate.rates[rate.currency])
      return {
        ...rate,
        messageErr: "Currency isn't defined",
      };
    return {
      ...rate,
      rate: dataRate.rates[rate.currency],
    };
  });
  return newRates;
};

export const login = async ({
  email,
  password,
  remember,
}: {
  email: string;
  password: string;
  remember: boolean;
}) => {
  const [result, err] = await query<any>((payload) => {
    return payload.login({
      collection: "users",
      data: {
        email,
        password,
      },
    });
  });
  if (!result?.token) {
    return {
      status: 401,
      code: "auth.invalid_credentials",
    };
  }
  const maxAge = remember ? 60 * 60 * 24 * 7 : 0;

  const cookieStore = await cookies();
  cookieStore.set({
    name: "payload-token",
    value: result.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(maxAge > 0 ? { maxAge } : {}),
  });

  return {
    status: 200,
    code: "auth.success",
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    },
  };
};

export const signup = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const [result, err] = await query<any>((payload) => {
    return payload.create({
      collection: "users",
      data: {
        name,
        email,
        password,
      },
    });
  });

  if (err) {
    return {
      status: 400,
      code: "auth.signup_failed",
    };
  }

  return {
    status: 200,
    code: "auth.signup_success",
    user: {
      id: result.id,
      email: result.email,
      role: result.role,
    },
  };
};

export const subscribeNewsletter = async (email: string, locale: Lang) => {
  const [result, err] = await query<any>((payload) => {
    return payload.create({
      collection: "email-subscribe",
      data: {
        email,
        locale: locale || "vi",
      },
    });
  });
  if (err) throw err;
  return result;
};

export const findReviewByProduct = async ({
  productId,
  limit,
  page,
  rating,
  q,
}: {
  productId: string;
  limit?: number;
  page?: number;
  rating?: number;
  q?: string;
}) => {
  const [result, err] = await query<ResponseDocs<any>>((payload) => {
    let where: any = {
       or:[
          {
            product:{
              id: {
                equals: productId,
              },
            }
          },{
            product:{
              equals: productId,
            }
          }
        ],
      parent: {
        or :[
          {
            parent: {
              equals: null,
            },
          },
          {
            parent: {
              equals: false,
            },
          }
        ]
      },
    };
    if (rating) {
      where.rating = { gte: rating };
    }
    if (q) {
      where.comment = { contains: q };
    }

    return payload.find({
      collection: "reviews",
      where:{
         or:[
          {
            product:{
              id: {
                equals: productId,
              },
            }
          },{
            product:{
              equals: productId,
            }
          }
        ],
         parent: {
        or :[
          {
            parent: {
              equals: null,
            },
          },
          {
            parent: {
              equals: false,
            },
          }
        ]
      },
   
      },
      limit: limit || 10,
      page: page || 1,
      depth: 2, // Populate user and replies (with their users)
    });
  });
  if (err) throw err;
  console.log({result})
  return result;
};

export const findRepliesByReview = async (reviewId: string) => {
  const [result, err] = await query<ResponseDocs<any>>((payload) => {
    return payload.find({
      collection: "reviews",
      where: {
        parent: {
          equals: reviewId,
        },
      },
      depth: 1, // Populate user relationship
      sort: "createdAt", // Oldest first
    });
  });
  if (err) throw err;
  return result;
};

export const replyReview = async ({
  productId,
  userId,
  parentId,
  content,
}: {
  productId: string;
  userId: string;
  parentId: string;
  content: string;
}) => {
  const [result, err] = await query<any>(async (payload) => {
    // Create reply review with parent field
    const createReview = await payload.create({
      collection: "reviews",
      data: {
        user: userId,
        product: productId,
        comment: content,
        parent: parentId, // Mark as reply
        // No rating for replies
      },
    });
    
    // Get current parent review to get existing replies
    const parentReview = await payload.findByID({
      collection: "reviews",
      id: parentId,
    });
    
    // Update parent review to add this reply to replies array
    const updateParentReview = await payload.update({
      collection: "reviews",
      id: parentId,
      data: {
        replies: [
          ...(Array.isArray(parentReview.replies) 
            ? parentReview.replies.map((r: any) => typeof r === 'string' ? r : r.id)
            : []),
          createReview.id,
        ],
      },
    });
    
    
    return updateParentReview;
  });

  if (err) throw err;
  return result;
};

export const createReview = async ({
  userId,
  productId,
  rating,
  comment,
  mediaIds,
}: {
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  mediaIds?: string[];
}) => {
  const [result, err] = await query<any>(async (payload) => {
 
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Create review
    return payload.create({
      collection: "reviews",
      data: {
        user: userId,
        product: productId,
        rating,
        comment: comment || "",
        media: mediaIds || [],
      },
    });
  });

  if (err) throw err;
  return result;
};

export const getCurrentUser = async () => {
  const [result, err] = await query<any>(async (payload) => {
    const cookieStore = await cookies();
    const headers = cookieStore.get("payload-token");
    const { user } = await payload.auth({ headers });

    return user;
  });
  if (err) return null;
  return result;
};


