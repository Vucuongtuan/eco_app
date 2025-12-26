import { query } from "@/lib/tryCatch";
import { Order } from "@/payload-types";
import { PaginatedDocs } from "payload";

export const findOrderStatus = async ({
  soft = "",
}: {
  soft?: string;
}): Promise<PaginatedDocs<Order>> => {
  const [result, err] = await query<PaginatedDocs<Order>>((payload) =>
    payload.find({
      collection: "orders",
      sort: soft,
      limit: 1000,
    })
  );
  if (err || !result) throw new Error("Failed to fetch orders");

  return result;
};
