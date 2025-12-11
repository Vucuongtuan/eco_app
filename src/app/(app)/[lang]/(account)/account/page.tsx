import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import configPromise from "@payload-config";
import { Lock, User } from "lucide-react";
import type { Metadata } from "next";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export default async function AccountSettings() {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent("Please login to access account settings.")}`
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-medium mb-8 text-text-primary">Account Settings</h1>

      <div className="space-y-6">
        {/* Profile Information */}
        <div className="bg-white border border-[#d1d5db] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-text-primary" />
            <h2 className="text-xl font-medium text-text-primary">
              Profile Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="bg-primary-background border border-[#d1d5db] rounded-lg px-4 py-3">
                <p className="text-text-primary">{user.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="bg-primary-background border border-[#d1d5db] rounded-lg px-4 py-3">
                <p className="text-text-primary">{user.email}</p>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <strong>Note:</strong> Profile editing functionality will be available soon. 
                Please contact support if you need to update your information.
              </p>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white border border-[#d1d5db] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-text-primary" />
            <h2 className="text-xl font-medium text-text-primary">
              Password & Security
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Keep your account secure by using a strong password.
            </p>

            <div className="pt-4">
              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <strong>Note:</strong> Password change functionality will be available soon. 
                Please use the "Forgot Password" link on the login page if you need to reset your password.
              </p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white border border-[#d1d5db] rounded-lg p-6">
          <h2 className="text-xl font-medium text-text-primary mb-4">
            Account Actions
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-red-600 text-white rounded-lg opacity-50 cursor-not-allowed text-sm"
              >
                Delete Account
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Account deletion is currently disabled. Please contact support if you wish to delete your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  description: "Manage your account settings.",
  openGraph: mergeOpenGraph({
    title: "Account Settings",
    url: "/account",
  }),
  title: "Account Settings",
};
