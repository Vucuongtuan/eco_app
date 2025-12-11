import { AddressListing } from "@/components/addresses/AddressListing";
import { CreateAddressModal } from "@/components/addresses/CreateAddressModal";
import { Button } from "@/components/ui/button";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import configPromise from "@payload-config";
import type { Metadata } from "next";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export default async function Addresses() {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent("Please login to access your addresses.")}`
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-medium text-text-primary">Addresses</h1>
        <CreateAddressModal>
          <Button className="bg-[#3569ed] hover:bg-[#2557d4]">
            Add New Address
          </Button>
        </CreateAddressModal>
      </div>

      <div className="bg-white border border-[#d1d5db] rounded-lg p-6">
        <AddressListing />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  description: "Your saved addresses.",
  openGraph: mergeOpenGraph({
    title: "Addresses",
    url: "/account/addresses",
  }),
  title: "Addresses",
};
