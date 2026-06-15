// app/admin/withdrawals/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Table, Typography, Button, App, Spin, Empty } from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  AccountBookOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import AdminGuard from "@/components/auth/AdminGuard";
import dayjs from "dayjs";
import WithdrawalActionModal from "@/components/ui/withdrawals/admin/withdrawActionModal";

const { Title, Text } = Typography;

export interface WithdrawalRow {
  id: string;
  reference: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user: { full_name: string; id: string; email: string | null } | null;
  bank_account: {
    bank_name: string;
    account_number: string;
    account_name: string;
  } | null;
}

export default function AdminWithdrawalsPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchWithdrawals();
  }, [activeTab]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("withdrawals")
        .select(
          `
          id, reference, amount, fee, net_amount, status, created_at,
          user:user_id(full_name, id),
          bank_account:bank_account_id(bank_name, account_number, account_name)
        `
        )
        .order("created_at", { ascending: false });

      if (activeTab !== "all") {
        query = query.eq("status", activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fix: Direct mapping, no array access
      const typedData: WithdrawalRow[] = (data || []).map((item: any) => ({
        ...item,
        user: item.user || null,
        bank_account: item.bank_account || null,
      }));

      setWithdrawals(typedData);

      // Calculate pending count for badge
      const pending = typedData.filter((w) => w.status === "pending").length;
      setPendingCount(pending);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      message.error("Failed to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (record: WithdrawalRow) => {
    setSelectedWithdrawal(record);
    setIsModalOpen(true);
  };

  const getStatusTag = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      completed: { bg: "bg-success-emerald/10", text: "text-success-emerald" },
      processing: { bg: "bg-secondary-fixed", text: "text-on-secondary-fixed" },
      pending: { bg: "bg-secondary-fixed", text: "text-on-secondary-fixed" },
      failed: { bg: "bg-error-container", text: "text-on-error-container" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${style.bg} ${style.text}`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      title: (
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
          User
        </span>
      ),
      key: "user",
      width: 250,
      render: (_: any, record: WithdrawalRow) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-sm">
            {record.user?.full_name
              ? record.user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "UN"}
          </div>
          <div>
            <Text className="font-label-md text-primary! block!">
              {record.user?.full_name || "Unknown"}
            </Text>
            <Text className="text-[12px]! text-outline!">
              ID: #{record.user?.id?.substring(0, 8).toUpperCase() || "N/A"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
          Bank Details
        </span>
      ),
      key: "bank",
      width: 250,
      render: (_: any, record: WithdrawalRow) => (
        <div className="space-y-1">
          <Text className="font-label-md text-on-surface! block!">
            {record.bank_account?.bank_name || "N/A"}
          </Text>
          <Text className="text-body-md font-mono text-outline! block!">
            {record.bank_account?.account_number || "N/A"}
          </Text>
          <Text className="text-[12px]! text-outline-variant!">
            Verified Holder
          </Text>
        </div>
      ),
    },
    {
      title: (
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
          Amounts
        </span>
      ),
      key: "amounts",
      width: 200,
      render: (_: any, record: WithdrawalRow) => (
        <div className="space-y-0.5">
          <div className="flex justify-between w-32">
            <span className="text-outline text-[12px]!">Gross:</span>
            <span className="font-bold text-on-surface">
              ₦{record.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between w-32 border-b border-outline-variant/20 pb-0.5">
            <span className="text-outline text-[12px]!">Fee:</span>
            <span className="text-error font-medium">
              -₦{record.fee.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between w-32 pt-0.5">
            <span className="text-outline text-[12px]!">Net:</span>
            <span className="font-bold text-primary">
              ₦{record.net_amount.toLocaleString()}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
          Date
        </span>
      ),
      dataIndex: "created_at",
      width: 150,
      render: (date: string) => (
        <div>
          <Text className="text-on-surface-variant! font-body-md! block!">
            {dayjs(date).format("MMM DD, YYYY")}
          </Text>
          <Text className="text-[12px]! text-outline!">
            {dayjs(date).format("hh:mm A")}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline text-center">
          Status
        </span>
      ),
      dataIndex: "status",
      width: 150,
      align: "center", // TS infers this correctly as literal 'center' in most setups, but if error persists, use: align: "center" as const
      render: (status: string) => getStatusTag(status),
    },
    {
      title: (
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline text-right">
          Action
        </span>
      ),
      key: "action",
      width: 120,
      align: "right", // TS infers this correctly as literal 'right'
      render: (_: any, record: WithdrawalRow) => (
        <Button
          size="medium"
          onClick={() => handleReview(record)}
          className="px-5! py-2! border! border-primary! text-primary! hover:bg-primary! hover:text-white! rounded-full! font-label-md! transition-all!"
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <AdminGuard>
      <div className="max-w-container-max mx-auto px-margin-desktop py-10 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-container/10 rounded-xl text-primary">
                <AccountBookOutlined className="text-[32px]" />
              </div>
              <Title
                level={1}
                className="font-headline-lg text-headline-lg text-primary! mb-0!"
              >
                Withdrawal Requests
              </Title>
            </div>
            <Text className="text-on-surface-variant! font-body-md! max-w-xl block!">
              Review and process artisan withdrawal requests. Maintain platform
              liquidity and provider trust through efficient verification.
            </Text>
          </div>
          <div className="flex gap-3">
            <Button
              icon={<DownloadOutlined className="text-[20px]" />}
              className="flex items-center gap-2 px-6! py-3! border! border-primary! text-primary! rounded-full! font-label-md! hover:bg-primary-container/5! transition-all!"
            >
              Export CSV
            </Button>
            <Button
              icon={<ReloadOutlined className="text-[20px]" />}
              onClick={fetchWithdrawals}
              className="flex items-center gap-2 px-6! py-3! bg-secondary! text-white! rounded-full! font-label-md! hover:opacity-90! shadow-md! shadow-secondary/20! transition-all!"
            >
              Refresh Queue
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="glass-card rounded-2xl p-2 flex flex-wrap gap-2 bg-surface-glass backdrop-blur-md border border-outline-variant/30">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md transition-all ${
              activeTab === "pending"
                ? "bg-primary text-white/80!"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Pending Review
            {pendingCount > 0 && (
              <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] text-white">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md transition-all ${
              activeTab === "completed"
                ? "bg-primary text-white/80!"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab("failed")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md transition-all ${
              activeTab === "failed"
                ? "bg-primary text-white/80!"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Failed
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label-md transition-all ${
              activeTab === "all"
                ? "bg-primary text-white/80!"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            All Requests
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" tip="Loading requests..." />
            </div>
          ) : withdrawals.length === 0 ? (
            <Empty
              description={
                <Text className="text-on-surface-variant! font-body-md!">
                  No withdrawal requests found
                </Text>
              }
              className="py-20"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table
                  //@ts-ignore
                  columns={columns}
                  dataSource={withdrawals}
                  rowKey="id"
                  pagination={false}
                  className="withdrawal-admin-table"
                  scroll={{ x: 1000 }}
                />
              </div>

              {/* Pagination Footer */}
              <div className="px-6 py-5 bg-surface-container-lowest flex items-center justify-between border-t border-outline-variant/20">
                <div className="flex items-center gap-4">
                  <select className="bg-transparent border-none focus:ring-0 text-label-sm text-outline cursor-pointer pr-8">
                    <option>10 / page</option>
                    <option>20 / page</option>
                    <option>50 / page</option>
                  </select>
                  <Text className="text-label-sm! text-outline!">
                    Showing 1-{withdrawals.length} of {withdrawals.length}{" "}
                    results
                  </Text>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg text-outline-variant cursor-not-allowed">
                    ‹
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white/80! font-label-md">
                    1
                  </button>
                  <button className="p-2 rounded-lg text-outline-variant cursor-not-allowed">
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Modal */}
        {selectedWithdrawal && (
          <WithdrawalActionModal
            open={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedWithdrawal(null);
            }}
            withdrawal={selectedWithdrawal}
            onSuccess={() => {
              setIsModalOpen(false);
              setSelectedWithdrawal(null);
              fetchWithdrawals();
            }}
          />
        )}

        <style>{`
          .withdrawal-admin-table .ant-table {
            background: transparent !important;
            font-family: 'Inter', sans-serif;
          }
          .withdrawal-admin-table .ant-table-thead > tr > th {
            background: var(--surface-container-low) !important;
            border-bottom: 1px solid var(--outline-variant/20) !important;
            padding: 20px 24px !important;
            font-weight: 600 !important;
            font-size: 12px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            color: var(--outline) !important;
          }
          .withdrawal-admin-table .ant-table-tbody > tr > td {
            padding: 24px !important;
            border-bottom: 1px solid var(--outline-variant/10) !important;
            vertical-align: middle !important;
          }
          .withdrawal-admin-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none !important;
          }
          .withdrawal-admin-table .ant-table-tbody > tr:hover > td {
            background: var(--surface-bright/50) !important;
          }
          .withdrawal-admin-table .ant-table-tbody > tr {
            transition: background-color 0.2s;
          }
        `}</style>
      </div>
    </AdminGuard>
  );
}
