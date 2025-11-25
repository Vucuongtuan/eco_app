// @ts-nocheck
import { adminOnly } from "@/access/adminOnly";
import { adminOnlyFieldAccess } from "@/access/adminOnlyFieldAccess";
import { adminOrCustomerOwner } from "@/access/adminOrCustomerOwner";
import { adminOrPublishedStatus } from "@/access/adminOrPublishedStatus";
import { customerOnlyFieldAccess } from "@/access/customerOnlyFieldAccess";
import { getServerSideURL } from "@/utilities/getURL";
import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { searchPlugin } from "@payloadcms/plugin-search";
import { seoPlugin } from "@payloadcms/plugin-seo";
import {
  GenerateDescription,
  GenerateTitle,
  GenerateURL,
} from "@payloadcms/plugin-seo/types";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { FieldsOverride } from "node_modules/@payloadcms/plugin-ecommerce/dist/types";
import { Plugin } from "payload";
import { ProductsCollection } from "./collections/Products";
export const defaultMeta = {
  brandName: "Moon co.",
  description: {
    vi: "Moon co. mang đến phong cách thời trang hiện đại cho nam, nữ và trẻ em với nhiều lựa chọn quần áo, giày dép và phụ kiện.",
    en: "Moon co. delivers modern fashion for men, women, and kids with a wide selection of clothing, shoes, and accessories.",
  } as Record<string, string>,
};

const generateTitle: GenerateTitle<any> = ({ doc }) => {
  // const brandTagline: Record<string, string> = {
  //   vi: 'Thời trang nam nữ, trẻ em - Quần áo, Giày dép, Phụ kiện',
  //   en: 'Fashion for Men, Women & Kids - Clothing, Shoes, Accessories'
  // };
  return `${doc.title} | ${defaultMeta.brandName}`;
};

const generateURL: GenerateURL<any> = ({ doc }) => {
  const url = getServerSideURL();

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

const generateDescription: GenerateDescription<any> = ({ doc, locale }) => {
  return doc.subTitle ? doc.subTitle : defaultMeta.description[locale || "vi"];
};

const applySearchForCollection = [
  "categories",
  "products",
  "variants",
  "posts",
  "pages",
];
const applySEOForCollection = ["products", "posts", "pages", "categories"];

// override field for seo plugin disable localized
const overrideSEOFields: FieldsOverride = ({ defaultFields }) => {
  const override = defaultFields.map((field) => {
    if ("name" in field && field.name) {
      return {
        ...field,
        localized: true,
      };
    }
    return field;
  });
  override.splice(3, 0, {
    name: "image",
    type: "upload",
    relationTo: "media",
    label: "SEO Image",
    required: false,
    localized: false,
  });
  return override;
};
export const plugins: Plugin[] = [
  seoPlugin({
    collections: applySEOForCollection,
    generateTitle,
    generateURL,
    generateDescription,
    fields: overrideSEOFields,
    generateImage: ({ doc }) => doc.image,
  }),
  searchPlugin({
    collections: applySearchForCollection,
    defaultPriorities: {
      categories: 10,
      products: 20,
    },
    searchOverrides: {
      // @ts-expect-error
      fields: ({ defaultFields }) =>
        defaultFields.map((field) => {
          if ((field as { name: string }).name === "doc") {
            return {
              ...field,
              relationTo: applySearchForCollection,
              admin: {
                ...((field as any).admin || {}),
                sortOptions: {
                  categories: "title",
                  products: "title",
                  brands: "title",
                  tags: "title",
                  subCategories: "title",
                },
              },
            };
          }
          return field;
        }),
    },
    beforeSync: ({ doc, searchDoc }: any) => {
      return {
        ...searchDoc,
        title: doc?.title,
      };
    },
    localize: true,
  }),

  // Ecommerce
  ecommercePlugin({
    access: {
      adminOnly,
      adminOnlyFieldAccess,
      adminOrCustomerOwner,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
    },
    customers: {
      slug: "users",
    },
    currencies: {
      supportedCurrencies: [
        {
          code: "USD",
          decimals: 2,
          symbol: "$",
          label: "US Dollar",
        },
        {
          code: "VND",
          decimals: 0,
          symbol: "₫",
          label: "Vietnamese Dong",
        },
      ],
      defaultCurrency: "VND",
    },
    payments: {
      // paymentMethods: [
      //   stripeAdapter({
      //     secretKey: process.env.STRIPE_SECRET_KEY!,
      //     publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      //     webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
      //     webhooks: {
      //       "payment_intent.succeeded": ({ event, req, stripe }) => {
      //         console.log("🎉 Payment intent succeeded:", event.id);
      //         console.log("Event data:", JSON.stringify(event.data, null, 2));
      //         req.payload.logger.info(`Payment succeeded: ${event.id}`);
      //       },
      //       "payment_intent.payment_failed": ({ event, req, stripe }) => {
      //         console.log("❌ Payment failed:", event.id);
      //         console.log("Event data:", JSON.stringify(event.data, null, 2));
      //         req.payload.logger.error(`Payment failed: ${event.id}`);
      //       },
      //     },
      //   }),
      // ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantsCollectionOverride: ({ defaultCollection }) => {
          console.log({ defaultCollection: defaultCollection.hooks });
          return {
            ...defaultCollection,
            hooks: {
              ...defaultCollection.hooks,
              beforeValidate: [
                async ({ data, operation, req }) => {
                  const queryProduct = await req.payload.findByID({
                    collection: "products",
                    id: data.product,
                  });

                  if (operation === "create") {
                    // Nếu cả USD và VND đều không được enabled, lấy giá trị từ product
                    if (!data.priceInUSDEnabled && !data.priceInVNDEnabled) {
                      data.priceInUSDEnabled =
                        queryProduct.priceInUSDEnabled || false;
                      data.priceInUSD = queryProduct.priceInUSDEnabled
                        ? queryProduct.priceInUSD
                        : 0;
                      data.priceInVNDEnabled =
                        (queryProduct as any).priceInVNDEnabled || false;
                      data.priceInVND = (queryProduct as any).priceInVNDEnabled
                        ? (queryProduct as any).priceInVND
                        : 0;
                    }
                    // Nếu USD được enabled nhưng chưa có giá
                    else if (data.priceInUSDEnabled && !data.priceInUSD) {
                      data.priceInUSD = queryProduct.priceInUSDEnabled
                        ? queryProduct.priceInUSD
                        : 0;
                    }
                    // Nếu VND được enabled nhưng chưa có giá
                    else if (data.priceInVNDEnabled && !data.priceInVND) {
                      data.priceInVND = (queryProduct as any).priceInVNDEnabled
                        ? (queryProduct as any).priceInVND
                        : 0;
                    }
                  } else if (operation === "update") {
                    // Nếu USD chưa enabled nhưng product có USD, copy sang
                    if (
                      !data.priceInUSDEnabled &&
                      !data.priceInUSD &&
                      queryProduct.priceInUSDEnabled &&
                      queryProduct.priceInUSD
                    ) {
                      data.priceInUSDEnabled = queryProduct.priceInUSDEnabled;
                      data.priceInUSD = queryProduct.priceInUSD;
                    }

                    // Nếu VND chưa enabled nhưng product có VND, copy sang
                    if (
                      !data.priceInVNDEnabled &&
                      !data.priceInVND &&
                      (queryProduct as any).priceInVNDEnabled &&
                      (queryProduct as any).priceInVND
                    ) {
                      data.priceInVNDEnabled = (
                        queryProduct as any
                      ).priceInVNDEnabled;
                      data.priceInVND = (queryProduct as any).priceInVND;
                    }
                  }

                  return data;
                },
              ],
            },
          };
        },
      },
    },
  }),

  // S3 vercel Blob
  vercelBlobStorage({
    collections: {
      media: {
        disableLocalStorage: true,
        prefix: "uploads",
        generateFileURL: async (args) =>
          args.filename
            ? `${process.env.BASE_URL_BLOB}/${args.prefix}/${args.filename}`
            : "",
      },
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || "",
  }),
];
