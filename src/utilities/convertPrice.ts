import { Lang } from "@/types";

export const formatPrice = (
  price: string | number,
  lang: Lang,
  discount?: number
) => {
  const valueInCents = Number(price) || 0;
  if(lang === 'vi') {
    
  }
} 