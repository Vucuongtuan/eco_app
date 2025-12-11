"use client";
import { OrderStatus } from "@/components/OrderStatus";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/Auth";
import { formatDateTime } from "@/utilities/formatDateTime";
import { Calendar, Clock, Mail, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProfileSkeleton } from "./ProfileSkeleton";

export default function ProfileScreen() {
  const { user } = useAuth();
  const t = useTranslations("profile");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give some time for auth to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  // Parse user data
  const orders = user.orders?.docs || [];
  const recentOrders = orders.slice(0, 3);
  const carts = user.cart?.docs || [];
  const activeCart = carts.find((cart: any) => typeof cart === 'object' && cart.status === "active");
  const sessions = user.sessions || [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Page Title */}
      <h1 className="text-3xl font-medium mb-8 text-text-primary">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-primary-background border border-[#d1d5db] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-text-primary">
                {t("personalInfo.title")}
              </h2>
              <Button variant="ghost" size="sm" className="text-[#3569ed]">
                {t("personalInfo.edit")}
              </Button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{t("personalInfo.name")}</p>
                  <p className="text-base font-medium text-text-primary">{user.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{t("personalInfo.email")}</p>
                  <p className="text-base font-medium text-text-primary break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-3">
                <ShoppingBag className="w-5 h-5 text-text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{t("personalInfo.role")}</p>
                  <div className="flex gap-2 mt-1">
                    {user.roles?.map((role: string) => (
                      <span
                        key={role}
                        className="inline-block px-3 py-1 bg-[#3569ed] text-white text-xs rounded-full"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{t("personalInfo.memberSince")}</p>
                  <p className="text-base font-medium text-text-primary">
                    {formatDateTime({
                      date: user.createdAt,
                      format: "dd/MM/yyyy",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Card */}
          <div className="bg-primary-background border border-[#d1d5db] rounded-lg p-6">
            <h2 className="text-xl font-medium text-text-primary mb-4">
              {t("sessions.title")}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {sessions.length} {t("sessions.active")}
            </p>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {sessions.slice(0, 3).map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between text-xs bg-white rounded p-3 border border-[#d1d5db]"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {formatDateTime({
                        date: session.createdAt,
                        format: "dd/MM/yyyy",
                      })}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {t("sessions.expires")}: {formatDateTime({
                      date: session.expiresAt,
                      format: "dd/MM",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Orders & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white border border-[#d1d5db] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-text-primary">
                {t("recentOrders.title")}
              </h2>
              {orders.length > 0 && (
                <Button variant="ghost" size="sm" asChild className="text-[#3569ed]">
                  <Link href="/orders">{t("recentOrders.viewAll")}</Link>
                </Button>
              )}
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t("recentOrders.noOrders")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="bg-primary-background border border-[#d1d5db] rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                            #{order.id.slice(0, 8)}
                          </span>
                          {order.status && <OrderStatus status={order.status} />}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {formatDateTime({
                            date: order.createdAt,
                            format: "dd MMMM yyyy",
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items?.length} {t("recentOrders.items")} • ${order.amount / 100}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>
                          {t("recentOrders.viewOrder")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Cart */}
          {activeCart && (
            <div className="bg-white border border-[#d1d5db] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-text-primary">
                  {t("activeCart.title")}
                </h2>
                <Button variant="ghost" size="sm" asChild className="text-[#3569ed]">
                  <Link href="/cart">{t("activeCart.viewCart")}</Link>
                </Button>
              </div>

              <div className="bg-primary-background border border-[#d1d5db] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-text-primary" />
                    <span className="text-sm text-gray-600">
                      {(activeCart as any).items?.length || 0} {t("activeCart.items")}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{t("activeCart.subtotal")}</p>
                    <p className="text-lg font-medium text-text-primary">
                      ${((activeCart as any).subtotal || 0) / 100}
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-[#3569ed] hover:bg-[#2557d4]" asChild>
                  <Link href="/checkout">{t("activeCart.checkout")}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}