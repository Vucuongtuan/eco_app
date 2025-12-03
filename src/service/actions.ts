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
