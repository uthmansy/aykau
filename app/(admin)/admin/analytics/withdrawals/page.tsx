// app/admin/analytics/withdrawals/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Typography, Spin, App, Table, Tag } from "antd";
import {
  WalletOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { supabase } from "@/services/supabase/client";
import AdminGuard from "@/components/auth/AdminGuard";
import dayjs from "dayjs";

const { Title, Text } = Typography;

// 🟢 Design System Colors (from DESIGN.md)
const COLORS = {
  primary: "#15196c", // Navy
  secondary: "#a53b15", // Coral Orange
  tertiary: "#2f0077", // Purple
  success: "#10B981", // Emerald
  error: "#ba1a1a", // Red
  warning: "#f97316", // Orange
  surfaceContainer: "#f0ecf4",
  outlineVariant: "#c7c5d3",
  onSurfaceVariant: "#464651",
};

interface AnalyticsData {
  total_withdrawn: number;
  total_fees: number;
  pending_count: number;
  completed_count: number;
  failed_count: number;
  success_rate: number;
  daily_volume: { date: string; total_amount: number; count: number }[];
  status_distribution: { status: string; count: number }[];
}

export default function WithdrawalAnalyticsPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: analytics, error } = await supabase.rpc(
        "get_withdrawal_analytics"
      );
      if (error) throw error;
      setData(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      message.error("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Loading analytics..." />
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.daily_volume.map((d) => ({
    date: dayjs(d.date).format("MMM DD"),
    amount: d.total_amount,
  }));

  const pieData = data.status_distribution.map((d) => ({
    name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
    value: d.count,
  }));

  const PIE_COLORS = {
    Completed: COLORS.success,
    Pending: COLORS.warning,
    Failed: COLORS.error,
    Processing: COLORS.primary,
  };

  // Custom Tooltip for Area Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-lowest! p-3! rounded-lg! shadow-[0_10px_32px_rgba(0,0,0,0.12)]! border! border-outline-variant/30!">
          <p className="text-xs! font-inter! text-on-surface-variant! mb-1!">
            {label}
          </p>
          <p className="text-sm! font-inter! font-bold! text-primary!">
            ₦{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminGuard>
      <div className="max-w-[1440px] mx-auto p-4 md:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <WalletOutlined className="text-[32px]" />
              </div>
              <Title
                level={1}
                className="font-headline-lg text-headline-lg text-primary! mb-0!"
              >
                Withdrawal Analytics
              </Title>
            </div>
            <Text className="text-on-surface-variant! font-body-md! max-w-xl block!">
              Monitor platform liquidity, fee revenue, and withdrawal success
              rates.
            </Text>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Withdrawn */}
          <div className="bg-surface-container-lowest! p-6! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]!">
            <div className="flex items-center justify-between mb-4">
              <Text className="text-xs! font-inter! font-semibold! uppercase! tracking-widest! text-on-surface-variant!">
                Total Withdrawn
              </Text>
              <WalletOutlined className="text-primary! text-xl!" />
            </div>
            <Title
              level={2}
              className="font-headline-md text-headline-md text-primary! mb-0!"
            >
              ₦{data.total_withdrawn.toLocaleString()}
            </Title>
            <Text className="text-xs! font-inter! text-on-surface-variant! mt-2! block!">
              Lifetime successful payouts
            </Text>
          </div>

          {/* Total Fees */}
          <div className="bg-surface-container-lowest! p-6! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]!">
            <div className="flex items-center justify-between mb-4">
              <Text className="text-xs! font-inter! font-semibold! uppercase! tracking-widest! text-on-surface-variant!">
                Platform Fees
              </Text>
              <PercentageOutlined className="text-secondary! text-xl!" />
            </div>
            <Title
              level={2}
              className="font-headline-md text-headline-md text-secondary! mb-0!"
            >
              ₦{data.total_fees.toLocaleString()}
            </Title>
            <Text className="text-xs! font-inter! text-on-surface-variant! mt-2! block!">
              Revenue from 0.5% processing fee
            </Text>
          </div>

          {/* Pending Requests */}
          <div className="bg-surface-container-lowest! p-6! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]!">
            <div className="flex items-center justify-between mb-4">
              <Text className="text-xs! font-inter! font-semibold! uppercase! tracking-widest! text-on-surface-variant!">
                Pending Review
              </Text>
              <ClockCircleOutlined className="text-warning! text-xl!" />
            </div>
            <Title
              level={2}
              className="font-headline-md text-headline-md text-warning! mb-0!"
            >
              {data.pending_count}
            </Title>
            <Text className="text-xs! font-inter! text-on-surface-variant! mt-2! block!">
              Awaiting admin approval
            </Text>
          </div>

          {/* Success Rate */}
          <div className="bg-surface-container-lowest! p-6! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]!">
            <div className="flex items-center justify-between mb-4">
              <Text className="text-xs! font-inter! font-semibold! uppercase! tracking-widest! text-on-surface-variant!">
                Success Rate
              </Text>
              <CheckCircleOutlined className="text-success! text-xl!" />
            </div>
            <Title
              level={2}
              className="font-headline-md text-headline-md text-success! mb-0!"
            >
              {data.success_rate}%
            </Title>
            <Text className="text-xs! font-inter! text-on-surface-variant! mt-2! block!">
              {data.completed_count} completed / {data.failed_count} failed
            </Text>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Volume Chart (Takes 2/3 width) */}
          <div className="lg:col-span-2 bg-surface-container-lowest! p-6! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]!">
            <Title
              level={4}
              className="font-headline-md text-headline-md text-primary! mb-6!"
            >
              Withdrawal Volume (Last 30 Days)
            </Title>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorAmount"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={COLORS.outlineVariant}
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={COLORS.onSurfaceVariant}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={COLORS.onSurfaceVariant}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) =>
                      `₦${val >= 1000 ? `${val / 1000}k` : val}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart (Takes 1/3 width) */}
          <div className="bg-surface-container-lowest! p-6! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]!">
            <Title
              level={4}
              className="font-headline-md text-headline-md text-primary! mb-6!"
            >
              Status Distribution
            </Title>
            <div className="h-[300px] w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            (PIE_COLORS as any)[entry.name] || COLORS.primary
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => value}
                      contentStyle={{
                        backgroundColor: COLORS.surfaceContainer,
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", fontFamily: "Inter" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Text className="text-on-surface-variant! font-inter!">
                  No data available
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
