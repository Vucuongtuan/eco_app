import { Lang } from "@/types";
import { templateHtml } from "@/utilities/templateHtml";
import { CollectionAfterChangeHook } from "payload";

export const afterChangeNewsletter: CollectionAfterChangeHook = async ({
  data,
  req,
  operation,
}) => {
  try {
    if (
      (data.status === "published" && operation === "update") ||
      operation === "create"
    ) {
      let emailsToSend: { email: string; locale: "vi" | "en" }[] = [];

      if (data.allEmail) {
        const allSubscribers = await req.payload.find({
          collection: "email-subscribe",
        });

        emailsToSend = allSubscribers.docs.map(
          // @ts-expect-error
          (subscriber: { email: string; locale: Lang }) => ({
            email: subscriber.email,
            locale: subscriber.locale || "vi",
          })
        );
      } else {
        emailsToSend = data.listEmail || [];
      }

      for (const email of emailsToSend) {
        const renderTemplate = templateHtml({
          title: data.title,
          content: "",
          type: data.template,
          ...(data.template === "blog" && { blogs: data.blog }),
          ...(data.template === "product" && { products: data.product }),
        });
        await req.payload.sendEmail({
          to: email,
          form: "vucuongtuansin1@gmail.com",
          subject: data.title,
          html: renderTemplate,
        });
      }
    }
  } catch (err) {
    console.error("Error in afterChangeNewsletter hook:", err);
  }
};
