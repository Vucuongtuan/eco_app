"use client";
import { Price } from "@/components/Price";
import { Category, Variant } from "@/payload-types";
import { Lang } from "@/types";
import { getDisplayPrice } from "@/utilities/getPriceValue";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface ProductInfoProps {
  lang: Lang;
  data: any;
  selectedVariant?: Variant | null;
  category: Category;
}

export function ProductInfo({
  data,
  lang,
  selectedVariant,
  category,
}: ProductInfoProps) {
  const t = useTranslations("product.details");
  // Fix price display logic
  // const displayPricing = data.priceInUSDEnabled && currentPrice;
  const displayStock = selectedVariant?.inventory || data.inventory;
  const variantName = (
    selectedVariant?.options.find(
      (opt) =>
        (opt as any).variantType ===
        data.variantTypes?.find((vt: { name: string }) => vt.name === "Colors")
          ?.id
    ) as { label: string }
  )?.label;
  const price = getDisplayPrice(data, selectedVariant);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
      >
        <Link
          href={"/" + lang}
          className="transition-colors hover:text-foreground"
        >
          {t("breadcrumb.home")}
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link
          href={"/" + lang + "/" + category.slug}
          className="transition-colors hover:text-foreground"
        >
          {category.title}
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-foreground">{data.title}</span>
      </nav>
      <header className="space-y-2">
        <motion.h1
          className="font-serif text-lg leading-tight tracking-tight text-foreground lg:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {data.title}
        </motion.h1>

        <motion.div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            {variantName && (
              <>
                <span className="text-sm text-muted-foreground">
                  {t("variantField")}: {variantName}
                </span>
                <span
                  className="h-1 w-1 rounded-full bg-muted-foreground/40"
                  aria-hidden="true"
                />
              </>
            )}
            {displayStock ? (
              <span className="text-green-600">{t("inStock")}</span>
            ) : (
              <span className="text-red-600">{t("outOfStock")}</span>
            )}
          </div>
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          aria-label={t("priceProduct")}
        >
          <Price lang={lang} {...price} />
          
        </motion.div>
      </header>
      <div className="h-px bg-gray-300" role="separator" aria-hidden="true" />
    </motion.div>
  );
}
