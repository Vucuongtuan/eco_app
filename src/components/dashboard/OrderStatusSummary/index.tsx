"use client";

import { CheckCircle2, Clock, Package, Truck } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const StatusCard = ({
  title,
  count,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  count: number;
  icon: any;
  color: string;
  bg: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1.25rem",
      backgroundColor: "var(--theme-elevation-50)",
      border: "1px solid var(--theme-elevation-100)",
      borderRadius: "8px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      transition: "all 0.2s",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        backgroundColor: bg,
        color: color,
        flexShrink: 0,
      }}
    >
      <Icon size={24} strokeWidth={2} />
    </div>
    <div>
      <div
        style={{
          fontSize: "0.875rem",
          color: "var(--theme-elevation-500)",
          marginBottom: "0.25rem",
          fontWeight: 500,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--theme-elevation-800)",
          lineHeight: 1,
        }}
      >
        {count}
      </div>
    </div>
  </div>
);

export const OrderStatusSummary: React.FC = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/orders?limit=1000");
        const json = await res.json();

        if (json.docs) {
          const counts = json.docs.reduce((acc: any, order: any) => {
            const status = order.status || "unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          setStats(counts);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div
        className="dashboard-group__card"
        style={{ flex: 1, minWidth: "300px", margin: "1rem" }}
      >
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--theme-elevation-500)",
          }}
        >
          Đang tải dữ liệu...
        </div>
      </div>
    );

  return (
    <div
      className="dashboard-group__card"
      style={{ flex: 1, minWidth: "300px", margin: "0" }}
    >
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
          Tổng quan đơn hàng
        </h4>
        <Link
          href="/admin/collections/orders"
          style={{
            fontSize: "0.875rem",
            color: "var(--theme-primary-500)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          View details &rarr;
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatusCard
          title="Chờ xử lý"
          count={stats.pending || 0}
          icon={Clock}
          color="#d97706" // Amber 600
          bg="#fffbeb" // Amber 50
        />
        <StatusCard
          title="Đang đóng gói"
          count={stats.processing || 0}
          icon={Package}
          color="#3b82f6" // Blue 500
          bg="#eff6ff" // Blue 50
        />
        <StatusCard
          title="Đang giao hàng"
          count={stats.shipping || 0}
          icon={Truck}
          color="#8b5cf6" // Violet 500
          bg="#f5f3ff" // Violet 50
        />
        <StatusCard
          title="Hoàn thành"
          count={stats.delivered || 0}
          icon={CheckCircle2}
          color="#10b981" // Emerald 500
          bg="#ecfdf5" // Emerald 50
        />
      </div>
    </div>
  );
};
