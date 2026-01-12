"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Media as MediaType,
  Product,
  VariantOption,
  VariantType,
} from "@/payload-types";
import { Lang } from "@/types";
import { useLocale, useTranslations } from "next-intl";
import { Media } from "../Media";
import { Price } from "../Price";
import { DeleteItemButton } from "./DeleteItemButton";
import { EditItemQuantityButton } from "./EditItemQuantityButton";
import { OpenCartButton } from "./OpenCart";

export function CartModal() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined;
    return cart.items.reduce(
      (quantity, item) => (item.quantity || 0) + quantity,
      0
    );
  }, [cart]);

  const totalPrice = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return 0;
    return cart.items.reduce((total, item) => {
      const product = item.product;
      const variant = item.variant;

      if (typeof product !== "object") return total;

      let price = (product as Product).priceInUSD || 0;

      if (variant && typeof variant === "object") {
        const discount = variant.options?.find((v: any) => {
          const variantType =
            typeof v.variantType === "number"
              ? v.variantType
              : (v.variantType as VariantType)?.id;
          return variantType === 3;
        }) as VariantOption | undefined;

        const valueDiscount = discount?.value?.includes("%")
          ? parseInt(discount.value.replace("%", ""))
          : discount?.value === "none"
            ? 0
            : parseInt(discount?.value || "0");

        if (variant.priceInUSD && valueDiscount > 0) {
          price =
            variant.priceInUSD - (variant.priceInUSD * valueDiscount) / 100;
        } else if (variant.priceInUSD) {
          price = variant.priceInUSD;
        } else if (!variant.priceInUSD && valueDiscount > 0) {
          const basePrice = (product as Product).priceInUSD || 0;
          price = basePrice - (basePrice * valueDiscount) / 100;
        }
      }
      return total + price * (item.quantity || 1);
    }, 0);
  }, [cart]);
  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild aria-label="Cart">
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>

          <SheetDescription>{t("empty.description")}</SheetDescription>
        </SheetHeader>

        {!cart || cart?.items?.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-2">
            <ShoppingCart className="h-16" />
            <p className="text-center text-2xl font-bold">{t("empty.title")}</p>
          </div>
        ) : (
          <div className="grow flex px-4">
            <div className="flex flex-col justify-between w-full">
              <ul className="grow overflow-auto py-4">
                {cart?.items?.map((item, i) => {
                  const product = item.product;
                  const variant = item.variant;
                  if (
                    typeof product !== "object" ||
                    !item ||
                    !product ||
                    !product.slug
                  )
                    return <React.Fragment key={i} />;

                  const metaImage =
                    product.meta?.image &&
                    typeof product.meta?.image === "object"
                      ? product.meta.image
                      : undefined;

                  const firstGalleryImage = Array.isArray(
                    product.gallery?.[0]?.image
                  )
                    ? product.gallery?.[0]?.image[0]
                    : undefined;

                  let image = firstGalleryImage || metaImage;

                  let price =
                    product.priceInUSDEnabled && (product.priceInUSD as number);

                  const isVariant =
                    Boolean(variant) && typeof variant === "object";

                  // ---
                  if (isVariant) {
                    price = variant?.priceInUSD;
                    const imageVariant = product.gallery?.find((item) => {
                      if (!item.variantOption) return false;
                      const variantOptionID =
                        typeof item.variantOption === "object"
                          ? item.variantOption.id
                          : item.variantOption;

                      const hasMatch = variant?.options?.some((option) => {
                        if (typeof option === "object")
                          return option.id === variantOptionID;
                        else return option === variantOptionID;
                      });

                      return hasMatch;
                    });

                    if (imageVariant && Array.isArray(imageVariant.image)) {
                      image = imageVariant.image[0] as MediaType;
                    }
                  } else {
                    const basePrice =
                      (product.priceInUSDEnabled && product.priceInUSD) || 0;
                    price = basePrice;
                  }

                  return (
                    <li className="flex w-full flex-col" key={i}>
                      <div className="relative flex w-full flex-cols justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <DeleteItemButton item={item} />
                        </div>
                        <Link
                          className="z-30 flex flex-row space-x-4"
                          href={`/products/${(item.product as Product)?.slug}`}
                        >
                          <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                            {typeof image === "object" && image && (
                              <Media
                                resource={image}
                                className="h-full w-full object-cover"
                                height={94}
                                width={94}
                              />
                            )}
                          </div>

                          <div className="flex flex-1 flex-col text-base">
                            <span className="leading-tight">
                              {product?.title}
                            </span>
                            {isVariant && variant ? (
                              <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                                {variant.options
                                  ?.map((option) => {
                                    if (typeof option === "object")
                                      return option.label;
                                    return null;
                                  })
                                  .join(", ")}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                        <div className="flex h-16 flex-col justify-between">
                          <Price
                            lang={locale as Lang}
                            amount={price || 0}
                            className="flex justify-end space-y-2 text-right text-sm"
                          />
                          <div className="ml-auto flex h-9 flex-row items-center rounded-lg border">
                            <EditItemQuantityButton item={item} type="minus" />
                            <p className="w-6 text-center">
                              <span className="w-full text-sm">
                                {item.quantity}
                              </span>
                            </p>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="px-4">
                <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {typeof cart?.subtotal === "number" && (
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>{t("total")}</p>

                      <Price
                        amount={totalPrice}
                        lang={"en"}
                        className="text-right text-base text-black dark:text-white"
                      />
                    </div>
                  )}

                  <Button asChild>
                    <Link className="w-full" href="/checkout">
                      {t("checkout")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
