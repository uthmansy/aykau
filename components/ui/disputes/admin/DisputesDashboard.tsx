// components/ui/disputes/admin/DisputesDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Tag, Select, Input, Typography, Button } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import dayjs from "dayjs";

const { Title, Text } = Typography;

// 🟢 UPDATED: Allow relations to be either an object or an array of objects
// This safely handles Supabase's type inference quirks with foreign keys
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
          `
          id,
          status,
          amount_disputed,
          created_at,
          job:job_requests(title),
          raiser:raised_by(full_name),
          against_user:against(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Cast to our flexible interface to satisfy TypeScript
      setDisputes((data as DisputeRow[]) || []);
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const searchLower = searchTerm.toLowerCase();

    // Safely extract values whether they are arrays or objects
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
      title: "Job / Contract",
      dataIndex: "job",
      key: "job",
      render: (job: any) => {
        const title = Array.isArray(job) ? job[0]?.title : job?.title;
        return <Text strong>{title || "Unknown Job"}</Text>;
      },
    },
    {
      title: "Parties",
      key: "parties",
      render: (_: any, record: DisputeRow) => {
        const raiserName = Array.isArray(record.raiser)
          ? record.raiser[0]?.full_name
          : record.raiser?.full_name;
        const againstName = Array.isArray(record.against_user)
          ? record.against_user[0]?.full_name
          : record.against_user?.full_name;

        return (
          <div className="flex flex-col text-sm gap-1">
            <Text>
              <span className="text-gray-500">Raiser:</span>{" "}
              {raiserName || "Unknown"}
            </Text>
            <Text>
              <span className="text-gray-500">Against:</span>{" "}
              {againstName || "Unknown"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount_disputed",
      key: "amount_disputed",
      render: (amount: number) => (
        <Text strong className="text-gray-900">
          ₦{Number(amount).toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          mediation: "orange",
          under_review: "red",
          resolved: "green",
          withdrawn: "default",
        };
        return (
          <Tag color={colorMap[status] || "default"}>
            {status.replace("_", " ").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Date Raised",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("MMM D, YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: DisputeRow) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/admin/disputes/${record.id}`)}
          className="!rounded-lg"
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={3} className="!mb-1">
            Dispute Resolution
          </Title>
          <Text type="secondary">
            Review and resolve escalated contract disputes
          </Text>
        </div>
      </div>

      <Card className="!rounded-xl !shadow-sm">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search by job title, user name, or dispute ID..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-96 !rounded-lg"
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            className="md:w-48"
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
          className="!text-sm"
        />
      </Card>
    </div>
  );
}
