// @ts-nocheck
import { adminOnlyFieldAccess } from "@/access/adminOnlyFieldAccess";
import { adminOrPublishedStatus } from "@/access/adminOrPublishedStatus";
import { customerOnlyFieldAccess } from "@/access/customerOnlyFieldAccess";
import { isAdmin } from "@/access/isAdmin";
import { isDocumentOwner } from "@/access/isDocumentOwner";
import { generateDocUrl, getServerSideURL } from "@/utilities/getURL";
import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { stripeAdapter } from "@payloadcms/plugin-ecommerce/payments/stripe";
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
import slugify from "slugify";
import { ProductsCollection } from "./collections/Products";
import { Media } from "./payload-types";
import { sendTelegramMessage } from "./utilities/telegram";
import { templateHtml } from "./utilities/templateHtml";
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
    beforeSync: async ({ originalDoc, searchDoc, req: { payload } }) => {
      let thumbnail = null;
      let blurMedia: string;

      if (originalDoc.image) {
        let media: Media;

        if (searchDoc.doc.relationTo === "products") {
          media = originalDoc.gallery?.[0].image[0];
          blurMedia = originalDoc.gallery?.[0].image[0]?.blurDataURL;
        } else if (searchDoc.doc.relationTo === "posts") {
          media = originalDoc.image;
          blurMedia = originalDoc.image?.blurDataURL;
        } else if (searchDoc.doc.relationTo === "categories") {
          media = originalDoc.meta.image;
          blurMedia = originalDoc.meta.image?.blurDataURL;
        }

        if (typeof media === "string") {
          thumbnail = await payload
            .findByID({
              collection: "media",
              id: media,
            })
            .then((res) => res.thumbnailURL)
            .catch(() => null);
        } else {
          thumbnail = media.thumbnailURL ?? null;
          blurMedia = media.blurDataURL;
        }
      }
      return {
        ...searchDoc,

        _title: originalDoc.title
          ? slugify(originalDoc.title, {
              locale: "vi",
              lower: true,
              replacement: " ",
            })
          : slugify(originalDoc.name, {
              locale: "vi",
              lower: true,
              replacement: " ",
            }),

        title: originalDoc.title ?? originalDoc.name,
        url: generateDocUrl({
          slug: originalDoc.slug,
          collection: searchDoc.doc.relationTo,
        }),
        thumbnail: thumbnail,
        blurMedia: blurMedia || "",
      };
    },
    collections: ["products", "posts", "categories"],
    defaultPriorities: {
      products: 10,
      posts: 7,
      categories: 5,
    },
    searchOverrides: {
      admin: {
        group: "Settings",
      },
      defaultPopulate: {
        id: true,
        title: true,
        _title: true,
        doc: true,
        thumbnail: true,
        url: true,
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: "_title",
          type: "text",
          admin: {
            readOnly: true,
          },
          label: "Plain Title",
          localized: true,
        },
        {
          name: "url",
          type: "text",
          admin: {
            readOnly: true,
          },
        },

        {
          name: "thumbnail",
          type: "text",
          admin: {
            position: "sidebar",
            readOnly: true,
          },
        },
      ],
    },
  }),

  // Ecommerce
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
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
      paymentMethods: [
        stripeAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY!,
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
          webhooks: {
            "checkout.session.completed": async ({ event, req, stripe }) => {
              console.log("============================================");
              console.log("🎉 WEBHOOK TRIGGERED: checkout.session.completed");
              console.log("============================================");

              const checkoutSession = event.data.object as any;
              const checkoutSessionID = checkoutSession.id;

              console.log("📋 Checkout Session Details:", {
                id: checkoutSessionID,
                amount: checkoutSession.amount,
                currency: checkoutSession.currency,
                status: checkoutSession.status,
                metadata: checkoutSession.metadata,
              });
            },
            "payment_intent.succeeded": async ({ event, req, stripe }) => {
              console.log("============================================");
              console.log("🎉 WEBHOOK TRIGGERED: payment_intent.succeeded");
              console.log("============================================");

              const paymentIntent = event.data.object as any;
              const paymentIntentID = paymentIntent.id;

              console.log("📋 Payment Intent Details:", {
                id: paymentIntentID,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                metadata: paymentIntent.metadata,
              });

              req.payload.logger.info(
                `Payment succeeded for PI: ${paymentIntentID}`
              );

              try {
                console.log(
                  "🔍 Searching for transaction with PaymentIntent:",
                  paymentIntentID
                );

                const { docs: transactions } = await req.payload.find({
                  collection: "transactions",
                  where: {
                    "stripe.paymentIntentID": {
                      equals: paymentIntentID,
                    },
                  },
                });

                console.log("📦 Transactions found:", transactions.length);
                console.log(
                  "📦 Transaction data:",
                  JSON.stringify(transactions, null, 2)
                );

                const transaction = transactions?.[0];

                if (!transaction) {
                  console.error(
                    "❌ No transaction found for PaymentIntent:",
                    paymentIntentID
                  );
                  req.payload.logger.warn(
                    `Transaction not found for PaymentIntent: ${paymentIntentID}`
                  );
                  return;
                }

                const customerEmail =
                  transaction.customerEmail || transaction.customer.email;
                console.log("✅ Transaction found:", {
                  id: transaction.id,
                  customerEmail: customerEmail,
                  amount: transaction.amount,
                  currency: transaction.currency,
                });

                if (customerEmail) {
                  console.log("📧 Attempting to send email to:", customerEmail);

                  try {
                    const emailTemplate = templateHtml({
                      title: "Xác nhận đơn hàng từ Moon co.",
                      type: "cart",
                      cart: transaction,
                      content: "",
                    });

                    await req.payload.sendEmail({
                      to: customerEmail,
                      from: "vucuongtuansin1@gmail.com",
                      subject: "Xác nhận đơn hàng từ Moon co.",
                      html: emailTemplate,
                    });

                    console.log(
                      "✅ Email sent successfully to:",
                      customerEmail
                    );
                    req.payload.logger.info(
                      `Order confirmation email sent to ${customerEmail}`
                    );

                    // Thông báo Telegram khi thanh toán thành công
                    try {
                      const amount = new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: transaction.currency || "VND",
                      }).format((transaction.amount || 0) / 100);

                      const items = transaction.items || [];
                      const itemsList = items
                        .map(
                          (item: any, index: number) =>
                            `${index + 1}. ${item.product?.title || item.title || "Sản phẩm"} x${item.quantity}`
                        )
                        .join("\n                        ");

                      const successMessage = `
                        ✅ <b>THANH TOÁN THÀNH CÔNG!</b>
                        --------------------------------
                        💰 <b>Tổng tiền:</b> ${amount}
                        📧 <b>Khách hàng:</b> ${customerEmail}
                        🆔 <b>Mã GD:</b> <code>${transaction.id}</code>
                        💳 <b>Payment Intent:</b> <code>${paymentIntentID}</code>
                        📦 <b>Sản phẩm:</b>
                            ${itemsList || "Không có thông tin"}
                        --------------------------------
                        <i>✅ Email xác nhận đã được gửi cho khách hàng.</i>
                      `;

                      await sendTelegramMessage(successMessage);
                    } catch (telegramErr) {
                      console.error(
                        "❌ Failed to send Telegram success notification:",
                        telegramErr
                      );
                    }
                  } catch (emailErr) {
                    console.error("❌ Email sending failed:", emailErr);
                    req.payload.logger.error(
                      `Failed to send email: ${emailErr}`
                    );

                    // Thông báo Telegram khi gửi email thất bại
                    try {
                      const amount = new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: transaction.currency || "VND",
                      }).format((transaction.amount || 0) / 100);

                      const errorMessage = `
                        ⚠️ <b>LỖI GỬI EMAIL XÁC NHẬN</b>
                        --------------------------------
                        💰 <b>Tổng tiền:</b> ${amount}
                        📧 <b>Khách hàng:</b> ${customerEmail}
                        🆔 <b>Mã GD:</b> <code>${transaction.id}</code>
                        ❌ <b>Lỗi:</b> ${emailErr instanceof Error ? emailErr.message : String(emailErr)}
                        --------------------------------
                        <i>⚠️ Thanh toán thành công nhưng email không gửi được. Vui lòng liên hệ khách hàng thủ công.</i>
                      `;

                      await sendTelegramMessage(errorMessage);
                    } catch (telegramErr) {
                      console.error(
                        "❌ Failed to send Telegram notification:",
                        telegramErr
                      );
                    }
                  }
                } else {
                  console.warn("⚠️ Transaction found but no customerEmail");

                  // Thông báo Telegram khi không có email khách hàng
                  try {
                    const amount = new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: transaction.currency || "VND",
                    }).format((transaction.amount || 0) / 100);

                    const warningMessage = `
                    ⚠️ <b>CẢNH BÁO: KHÔNG CÓ EMAIL KHÁCH HÀNG</b>
                    --------------------------------
                    💰 <b>Tổng tiền:</b> ${amount}
                    🆔 <b>Mã GD:</b> <code>${transaction.id}</code>
                    💳 <b>Payment Intent:</b> <code>${paymentIntentID}</code>
                    --------------------------------
                    <i>⚠️ Thanh toán thành công nhưng không có email để gửi xác nhận.</i>
                  `;

                    await sendTelegramMessage(warningMessage);
                  } catch (telegramErr) {
                    console.error(
                      "❌ Failed to send Telegram notification:",
                      telegramErr
                    );
                  }
                }
              } catch (err) {
                console.error("❌ Error processing webhook:", err);
                console.error(
                  "Error stack:",
                  err instanceof Error ? err.stack : "No stack trace"
                );
                req.payload.logger.error(
                  `Error processing payment success webhook: ${err}`
                );

                // Thông báo Telegram khi có lỗi xử lý webhook
                try {
                  const errorMessage = `
                    🚨 <b>LỖI XỬ LÝ WEBHOOK THANH TOÁN</b>
                    --------------------------------
                    💳 <b>Payment Intent:</b> <code>${paymentIntentID}</code>
                    ❌ <b>Lỗi:</b> ${err instanceof Error ? err.message : String(err)}
                    📋 <b>Stack:</b> <code>${err instanceof Error ? err.stack?.substring(0, 200) : "N/A"}</code>
                    --------------------------------
                    <i>🚨 Cần kiểm tra ngay! Có thể có đơn hàng chưa được xử lý.</i>
                  `;

                  await sendTelegramMessage(errorMessage);
                } catch (telegramErr) {
                  console.error(
                    "❌ Failed to send Telegram notification:",
                    telegramErr
                  );
                }
              }

              console.log("============================================");
              console.log("✅ WEBHOOK PROCESSING COMPLETED");
              console.log("============================================");
            },
            "payment_intent.payment_failed": async ({ event, req, stripe }) => {
              console.log("============================================");
              console.log(
                "❌ WEBHOOK TRIGGERED: payment_intent.payment_failed"
              );
              console.log("============================================");

              const paymentIntent = event.data.object as any;
              const paymentIntentID = paymentIntent.id;

              console.log("❌ Payment failed:", event.id);
              console.log("Event data:", JSON.stringify(event.data, null, 2));
              req.payload.logger.error(`Payment failed: ${event.id}`);

              // Thông báo Telegram khi thanh toán thất bại
              try {
                const amount = paymentIntent.amount || 0;
                const currency = paymentIntent.currency?.toUpperCase() || "VND";
                const formattedAmount = new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: currency === "USD" ? "USD" : "VND",
                }).format(amount / 100);

                const customerEmail =
                  paymentIntent.receipt_email ||
                  paymentIntent.metadata?.customerEmail ||
                  "Unknown";
                const errorMessage =
                  paymentIntent.last_payment_error?.message ||
                  "Không có thông tin lỗi";
                const errorCode =
                  paymentIntent.last_payment_error?.code || "N/A";

                const failureMessage = `
                  ❌ <b>THANH TOÁN THẤT BẠI!</b>
                  --------------------------------
                  💰 <b>Số tiền:</b> ${formattedAmount}
                  📧 <b>Khách hàng:</b> ${customerEmail}
                  💳 <b>Payment Intent:</b> <code>${paymentIntentID}</code>
                  ❌ <b>Mã lỗi:</b> <code>${errorCode}</code>
                  📝 <b>Chi tiết lỗi:</b> ${errorMessage}
                  🕐 <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}
                  --------------------------------
                  <i>❌ Khách hàng có thể cần hỗ trợ. Vui lòng theo dõi.</i>
                `;

                await sendTelegramMessage(failureMessage);
                console.log(
                  "✅ Telegram notification sent for payment failure"
                );
              } catch (telegramErr) {
                console.error(
                  "❌ Failed to send Telegram notification:",
                  telegramErr
                );
                req.payload.logger.error(
                  `Failed to send Telegram notification for payment failure: ${telegramErr}`
                );
              }

              console.log("============================================");
              console.log("❌ PAYMENT FAILURE PROCESSING COMPLETED");
              console.log("============================================");
            },
          },
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantsCollectionOverride: ({ defaultCollection }) => {
          return {
            ...defaultCollection,
            hooks: {
              beforeValidate: [
                async ({ data, operation, req }) => {
                  const queryProduct = await req.payload.findByID({
                    collection: "products",
                    id: data.product,
                  });

                  if (operation === "create") {
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

    transactions: {
      transactionCollectionOverride: ({ defaultCollection }) => {
        return {
          ...defaultCollection,
          hooks: {
            beforeChange: [
              async ({ data, req, operation }) => {
                if (operation === "create" && !data.customerEmail) {
                  data.customerEmail = data.customer.email;
                }
                return data;
              },
            ],
            afterChange: [
              //
              async ({ data, req, operation }) => {
                if (operation === "create") {
                  const template = templateHtml({
                    title: "Xác nhận đơn hàng từ Moon co.",
                    cart: data.cart,
                    type: "cart",
                    content: "",
                  });
                  // Send order confirmation email
                  try {
                    await req.payload.sendEmail({
                      to: data.customerEmail || data.customer.email,
                      form: "vucuongtuansin1@gmail.com",
                      subject: "Xác nhận đơn hàng từ Moon co.",
                      html: template,
                    });
                  } catch (error) {
                    req.payload.logger.error(`Error sending email: ${error}`);
                  }

                  // Send Notification to Telegram Admin Group
                  try {
                    const amount = new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: data.currency || "VND",
                    }).format((data.amount || 0) / 100);
                    const customerEmail =
                      data.customerEmail || data.customer?.email || "Unknown";
                    const transactionId = data.id;

                    const message = `
                        <b>🚀 ĐƠN HÀNG MỚI!</b>
                        --------------------------------
                        💰 <b>Tổng tiền:</b> ${amount}
                        📧 <b>Khách hàng:</b> ${customerEmail}
                        🆔 <b>Mã GD:</b> <code>${transactionId}</code>
                        --------------------------------
                        <i>Kiểm tra ngay trong trang quản trị.</i>
                    `;

                    await sendTelegramMessage(message);
                  } catch (error) {
                    req.payload.logger.error(
                      `Error sending Telegram notification: ${error}`
                    );
                  }
                }
              },
            ],
          },
        };
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
