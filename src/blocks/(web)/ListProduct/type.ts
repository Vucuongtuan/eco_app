import { Product } from "@/payload-types";
import { Lang } from "@/types";

export interface ListProductProps {
  gap: number;
  data: Product[];
  lang: Lang;
}
