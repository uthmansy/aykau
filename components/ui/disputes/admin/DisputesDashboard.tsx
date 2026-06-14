"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Select, Input, Button } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import dayjs from "dayjs";

interface DisputeRow {
  id: string;
  status: string;
  amount_disputed: number;
  created_at: string;
  job: { title: string } | { title: string }[] | null;
  raiser: { full_name: string } | { full_name: string }[] | null;
  against_user: { full_name: string } | { full_name: string }[] | null;
}

export default function DisputesDashboard() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDisputes();
  }, [filterStatus]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("disputes")
        .select(
          `id, status, amount_disputed, created_at, job:job_requests(title), raiser:raised_by(full_name), against_user:against(full_name)`
        )
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDisputes((data as DisputeRow[]) || []);
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const searchLower = searchTerm.toLowerCase();
    const jobTitle = Array.isArray(d.job) ? d.job[0]?.title : d.job?.title;
    const raiserName = Array.isArray(d.raiser)
      ? d.raiser[0]?.full_name
      : d.raiser?.full_name;
    const againstName = Array.isArray(d.against_user)
      ? d.against_user[0]?.full_name
      : d.against_user?.full_name;

    return (
      jobTitle?.toLowerCase().includes(searchLower) ||
      raiserName?.toLowerCase().includes(searchLower) ||
      againstName?.toLowerCase().includes(searchLower) ||
      d.id.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: (
        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Job / Contract
        </span>
      ),
      dataIndex: "job",
      key: "job",
      render: (job: any) => {
        const title = Array.isArray(job) ? job[0]?.title : job?.title;
        return (
          <span className="font-inter text-[14px] font-medium text-on-surface">
            {title || "Unknown Job"}
          </span>
        );
      },
    },
    {
      title: (
        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Parties
        </span>
      ),
      key: "parties",
      render: (_: any, record: DisputeRow) => {
        const raiserName = Array.isArray(record.raiser)
          ? record.raiser[0]?.full_name
          : record.raiser?.full_name;
        const againstName = Array.isArray(record.against_user)
          ? record.against_user[0]?.full_name
          : record.against_user?.full_name;

        return (
          <div className="flex flex-col font-inter text-[14px] gap-1">
            <span className="text-on-surface-variant">
              <span className="text-outline">Raiser:</span>{" "}
              {raiserName || "Unknown"}
            </span>
            <span className="text-on-surface-variant">
              <span className="text-outline">Against:</span>{" "}
              {againstName || "Unknown"}
            </span>
          </div>
        );
      },
    },
    {
      title: (
        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Amount
        </span>
      ),
      dataIndex: "amount_disputed",
      key: "amount_disputed",
      render: (amount: number) => (
        <span className="font-manrope text-[16px] font-semibold text-primary">
          ₦{Number(amount).toLocaleString()}
        </span>
      ),
    },
    {
      title: (
        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Status
        </span>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        // ✅ Mapped strictly to DESIGN.md functional colors
        const statusStyles = {
          mediation: {
            bg: "bg-warning/10",
            text: "text-warning",
            label: "In Mediation",
          },
          under_review: {
            bg: "bg-error/10",
            text: "text-error",
            label: "Under Review",
          },
          resolved: {
            bg: "bg-success-emerald/10",
            text: "text-success-emerald",
            label: "Resolved",
          },
          withdrawn: {
            bg: "bg-on-surface-variant/10",
            text: "text-on-surface-variant",
            label: "Withdrawn",
          },
        }[status] || {
          bg: "bg-on-surface-variant/10",
          text: "text-on-surface-variant",
          label: status,
        };

        return (
          <span
            className={`px-2.5 py-1 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider ${statusStyles.bg} ${statusStyles.text}`}
          >
            {statusStyles.label}
          </span>
        );
      },
    },
    {
      title: (
        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Date Raised
        </span>
      ),
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span className="font-inter text-[14px] text-on-surface-variant">
          {dayjs(date).format("MMM D, YYYY")}
        </span>
      ),
    },
    {
      title: (
        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Action
        </span>
      ),
      key: "action",
      render: (_: any, record: DisputeRow) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/admin/disputes/${record.id}`)}
          // ✅ Navy (Primary) fill for admin actions
          className="rounded-lg! h-auto! py-1.5! px-4! bg-primary! hover:bg-primary/90! border-none! font-inter! text-[12px]! font-medium!"
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-manrope text-[32px] font-semibold text-primary leading-tight">
          Dispute Resolution
        </h1>
        <p className="font-inter text-[16px] text-on-surface-variant mt-2">
          Review and resolve escalated contract disputes
        </p>
      </div>

      {/* Main Dashboard Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by job title, user name, or dispute ID..."
            prefix={<SearchOutlined className="text-outline" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-96! bg-surface-container! border-none! rounded-lg! h-10! px-4! font-inter! text-[14px]! focus:ring-1! focus:ring-primary/30!"
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            className="md:w-48! [&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[14px]!"
            options={[
              { value: "all", label: "All Statuses" },
              { value: "mediation", label: "In Mediation (48h)" },
              { value: "under_review", label: "Under Review" },
              { value: "resolved", label: "Resolved" },
              { value: "withdrawn", label: "Withdrawn" },
            ]}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredDisputes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </div>
    </div>
  );
}
