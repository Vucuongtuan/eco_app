"use client";

import { CheckoutAddresses } from "@/components/Checkout/CheckoutAddresses";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Media } from "@/components/Media";
import { Message } from "@/components/Message";
import { Price } from "@/components/Price";
import { AddressItem } from "@/components/addresses/AddressItem";
import { CreateAddressModal } from "@/components/addresses/CreateAddressModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cssVariables } from "@/cssVariables";
import type { Media as MediaType, Product } from "@/payload-types";
import { Address } from "@/payload-types";
import { useAuth } from "@/providers/Auth";
import { useTheme } from "@/providers/Theme";
import { Lang } from "@/types";
import {
  useAddresses,
  useCart,
  usePayments,
} from "@payloadcms/plugin-ecommerce/client/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckoutForm } from "../form/CheckoutForm";
import { FormItem } from "../form/FormItem";

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`;
const stripe = loadStripe(apiKey);

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  
  const router = useRouter();
  const { cart } = useCart();
  const [error, setError] = useState<null | string>(null);
  const { theme } = useTheme();
  const locale = useLocale();
  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState("");
  const [emailEditable, setEmailEditable] = useState(true);
  const [paymentData, setPaymentData] = useState<null | Record<
    string,
    unknown
  >>(null);
  const { initiatePayment } = usePayments();
  const { addresses } = useAddresses();
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>();
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>();
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] =
    useState(true);
  const [isProcessingPayment, setProcessingPayment] = useState(false);
  const cartIsEmpty = !cart || !cart.items || !cart.items.length;

  const canGoToPayment = Boolean(
    (email || user) &&
      billingAddress &&
      (billingAddressSameAsShipping || shippingAddress)
  );

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0];
        if (defaultAddress) {
          setBillingAddress(defaultAddress);
        }
      }
    }
  }, [addresses]);

  useEffect(() => {
    return () => {
      setShippingAddress(undefined);
      setBillingAddress(undefined);
      setBillingAddressSameAsShipping(true);
      setEmail("");
      setEmailEditable(true);
    };
  }, []);

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping
              ? billingAddress
              : shippingAddress,
          },
        })) as Record<string, unknown>;

        if (paymentData) {
          setPaymentData(paymentData);
        }
      } catch (error) {
        const errorData =
          error instanceof Error ? JSON.parse(error.message) : {};
        let errorMessage = "An error occurred while initiating payment.";

        if (errorData?.cause?.code === "OutOfStock") {
          errorMessage = "One or more items in your cart are out of stock.";
        }

        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
    [billingAddress, billingAddressSameAsShipping, shippingAddress]
  );

  if (!stripe) return null;

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>Processing your payment...</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>Your cart is empty.</p>
        <Link href="/search">Continue shopping?</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        <h2 className="font-medium text-3xl">Contact</h2>
        {!user && (
          <div className=" bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
            <div className="prose dark:prose-invert">
              <Button
                asChild
                className="no-underline text-inherit"
                variant="outline"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">or</span>
                <Link href="/create-account">create an account</Link>
              </p>
            </div>
          </div>
        )}
        {user ? (
          <div className="bg-accent dark:bg-card rounded-lg p-4 ">
            <div>
              <p>{user.email}</p>{" "}
              <p>
                Not you?{" "}
                <Link className="underline" href="/logout">
                  Log out
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4 ">
            <div>
              <p className="mb-4">Enter your email to checkout as a guest.</p>

              <FormItem className="mb-6">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </FormItem>

              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault();
                  setEmailEditable(false);
                }}
                variant="default"
              >
                Continue as guest
              </Button>
            </div>
          </div>
        )}

        <h2 className="font-medium text-3xl">Address</h2>

        {billingAddress ? (
          <div>
            <AddressItem
              actions={
                <Button
                  variant={"outline"}
                  disabled={Boolean(paymentData)}
                  onClick={(e) => {
                    e.preventDefault();
                    setBillingAddress(undefined);
                  }}
                >
                  Remove
                </Button>
              }
              address={billingAddress}
            />
          </div>
        ) : user ? (
          <CheckoutAddresses
            heading="Billing address"
            setAddress={setBillingAddress}
          />
        ) : (
          <CreateAddressModal
            disabled={!email || Boolean(emailEditable)}
            callback={(address) => {
              setBillingAddress(address);
            }}
            skipSubmission={true}
          />
        )}

        <div className="flex gap-4 items-center">
          <Checkbox
            id="shippingTheSameAsBilling"
            checked={billingAddressSameAsShipping}
            disabled={Boolean(
              paymentData || (!user && (!email || Boolean(emailEditable)))
            )}
            onCheckedChange={(state: boolean) => {
              setBillingAddressSameAsShipping(state);
            }}
          />
          <Label htmlFor="shippingTheSameAsBilling">
            Shipping is the same as billing
          </Label>
        </div>

        {!billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <div>
                <AddressItem
                  actions={
                    <Button
                      variant={"outline"}
                      disabled={Boolean(paymentData)}
                      onClick={(e) => {
                        e.preventDefault();
                        setShippingAddress(undefined);
                      }}
                    >
                      Remove
                    </Button>
                  }
                  address={shippingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses
                heading="Shipping address"
                description="Please select a shipping address."
                setAddress={setShippingAddress}
              />
            ) : (
              <CreateAddressModal
                callback={(address) => {
                  setShippingAddress(address);
                }}
                disabled={!email || Boolean(emailEditable)}
                skipSubmission={true}
              />
            )}
          </>
        )}

        {!paymentData && (
          <Button
            className="self-start"
            disabled={!canGoToPayment}
            onClick={(e) => {
              e.preventDefault();
              void initiatePaymentIntent("stripe");
            }}
          >
            Go to payment
          </Button>
        )}

        {!paymentData?.["clientSecret"] && error && (
          <div className="my-8">
            <Message error={error} />

            <Button
              onClick={(e) => {
                e.preventDefault();
                router.refresh();
              }}
              variant="default"
            >
              Try again
            </Button>
          </div>
        )}

        <Suspense fallback={<React.Fragment />}>
          {/* @ts-ignore */}
          {paymentData && paymentData?.["clientSecret"] && (
            <div className="pb-16">
              <h2 className="font-medium text-3xl">Payment</h2> 
              {error && <p>{`Error: ${error}`}</p>}
              <Elements
                options={{
                  appearance: {
                    theme: "stripe",
                    variables: {
                      borderRadius: "6px",
                      colorPrimary: "#858585",
                      gridColumnSpacing: "20px",
                      gridRowSpacing: "20px",
                      colorBackground:
                        theme === "dark"
                          ? "#0a0a0a"
                          : cssVariables.colors.base0,
                      colorDanger: cssVariables.colors.error500,
                      colorDangerText: cssVariables.colors.error500,
                      colorIcon:
                        theme === "dark"
                          ? cssVariables.colors.base0
                          : cssVariables.colors.base1000,
                      colorText:
                        theme === "dark"
                          ? "#858585"
                          : cssVariables.colors.base1000,
                      colorTextPlaceholder: "#858585",
                      fontFamily: "Geist, sans-serif",
                      fontSizeBase: "16px",
                      fontWeightBold: "600",
                      fontWeightNormal: "500",
                      spacingUnit: "4px",
                    },
                  },
                  clientSecret: paymentData["clientSecret"] as string,
                }}
                stripe={stripe}
              >
                <div className="flex flex-col gap-8">
                  <CheckoutForm
                    customerEmail={email}
                    billingAddress={billingAddress}
                    setProcessingPayment={setProcessingPayment}
                  />
                  <Button
                    variant="ghost"
                    className="self-start"
                    onClick={() => setPaymentData(null)}
                  >
                    Cancel payment
                  </Button>
                </div>
              </Elements>
            </div>
          )}
        </Suspense>
      </div>

      {!cartIsEmpty && (
        <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-primary/5 flex flex-col gap-8 rounded-lg">
          <h2 className="text-3xl font-medium">Your cart</h2>
          {cart?.items?.map((item, index) => {
            if (typeof item.product === "object" && item.product) {
              const {
                product,
                product: { id, meta, title, gallery },
                quantity,
                variant,
              } = item;

              if (!quantity) return null;

              let image = gallery?.[0]?.image || meta?.image;
              let price =
                (product as Product).priceInUSDEnabled && product.priceInUSD;
              const isVariant = Boolean(variant) && typeof variant === "object";

              if (isVariant && variant) {
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

                if (imageVariant && typeof imageVariant.image !== "string") {
                  image = imageVariant.image;
                }

                

                price = variant.priceInUSDEnabled ? variant.priceInUSD : product.priceInUSD;

                // const priceSroft = 
              }
        
              return (
                <div className="flex items-start gap-4" key={index}>
                  <div className="flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
                    <div className="relative w-full h-full">
                      {image && typeof image !== "string" && (
                        <Media
                          className=""
                          fill
                          imgClassName="rounded-lg"
                          // @ts-expect-error
                          resource={image[0] as MediaType}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex grow justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-lg">{title}</p>
                      {variant && typeof variant === "object" && (
                        <p className="text-sm font-mono text-primary/50 tracking-[0.1em]">
                          {variant.options
                            ?.map((option) => {
                              if (typeof option === "object")
                                return option.label;
                              return null;
                            })
                            .join(", ")}
                        </p>
                      )}
                      <div>
                        {"x"}
                        {quantity}
                      </div>
                    </div>

                    <Price amount={price || 0} lang={locale as Lang} />
                  </div>
                </div>
              );
            }
            return null;
          })}
          <hr />
          <div className="flex justify-between items-center gap-2">
            <span className="uppercase">Total</span>{" "}
            <Price
              className="text-3xl font-medium"
              amount={cart.subtotal || 0}
              lang={locale as Lang}
            />
          </div>

          {/* Note Test */}
          <div className="gap-2">
<div className="note formal">
  <span className="uppercase">Note</span>
  <p>Đây là dự án phát triển cá nhân nên hiện tại chưa kích hoạt thanh toán thực tế.</p>
  <p>Giá trị hiển thị trong giỏ hàng chỉ mang tính chất thử nghiệm (test data).</p>
  <p>Bạn có thể sử dụng các thẻ test của Stripe để kiểm tra quy trình thanh toán. Khi thanh toán thực tế được cấu hình, chúng tôi sẽ gửi thông báo qua email của bạn.</p>
  <p>Thẻ test Stripe (ví dụ):</p>
  <ul>
    <li>4242 4242 4242 4242 — Visa (thanh toán thành công)</li>
    <li>4000 0000 0000 0002 — Card bị từ chối (declined)</li>
    <li>4000 0000 0000 3220 — Yêu cầu 3D Secure (test flow)</li>
  </ul>
</div>

          </div>
        </div>
      )}
    </div>
  );
};
