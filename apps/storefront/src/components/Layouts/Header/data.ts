import { cache } from "react";
import { getCurrentCustomerAction } from "@/services/actions";

/**
 * HeaderNavigation và HeaderActions đều cần customer.
 * cache() của React dedupe trong cùng một request -> chỉ gọi API 1 lần.
 */
export const getCustomer = cache(() => getCurrentCustomerAction());
