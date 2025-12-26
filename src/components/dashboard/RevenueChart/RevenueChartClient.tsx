"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "var(--theme-elevation-0)",
          border: "1px solid var(--theme-elevation-200)",
          padding: "0.75rem",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            color: "var(--theme-elevation-500)",
            marginBottom: "0.25rem",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: "var(--theme-primary-500)",
          }}
        >
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChartClient = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders?limit=1000&sort=-createdAt");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.docs || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const { data, totalRevenue } = useMemo(() => {
    if (!orders || orders.length === 0)
      return { data: null, totalRevenue: 0 };
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      })
      .reverse();

    let calculatedTotal = 0;

    const chartData = last7Days.map((date) => {
      const dayOrders = orders.filter(
        (order: any) =>
          order.createdAt.startsWith(date) && order.status !== "cancelled" // Exclude cancelled if needed
      );
      const dailyTotal = dayOrders.reduce(
        (sum: number, order: any) => sum + (order.amount || 0),
        0
      );
      calculatedTotal += dailyTotal;

      // Format date as DD/MM
      const [year, month, day] = date.split("-");
      return {
        date: `${day}/${month}`,
        fullDate: date,
        revenue: dailyTotal,
      };
    });

    return { data: chartData, totalRevenue: calculatedTotal };
  }, [orders]);

  if (isLoading)
    return (
      <div
        className="dashboard-group__card"
        style={{ flex: 1, minWidth: "300px", margin: "1rem" }}
      >
        <Skeleton className="h-[400px] w-full" />
      </div>
    );

  return (
    <div
      className="dashboard-group__card"
      style={{ flex: 1, minWidth: "300px", margin: "0" }}
    >
      <div
        style={{
          backgroundColor: "var(--theme-elevation-50)",
          border: "1px solid var(--theme-elevation-100)",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--theme-elevation-500)",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Doanh thu 7 ngày qua
            </h4>
            <div
              style={{
                fontSize: "1.875rem",
                fontWeight: 700,
                color: "var(--theme-elevation-800)",
                marginTop: "0.5rem",
              }}
            >
              {formatCurrency(totalRevenue)}
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--theme-elevation-150)"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--theme-elevation-500)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--theme-elevation-500)", fontSize: 12 }}
                tickFormatter={(val) => `${val / 1000000}M`}
              />
              <Tooltip
                cursor={{ fill: "var(--theme-elevation-100)", opacity: 0.5 }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="revenue"
                fill="var(--theme-primary-500)"
                radius={[6, 6, 0, 0]}
                barSize={40}
                activeBar={{ fill: "var(--theme-primary-600)" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
