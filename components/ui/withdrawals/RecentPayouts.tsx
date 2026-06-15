// components/dashboard/withdrawals/RecentPayouts.tsx
import { Table, Typography, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface Withdrawal {
  id: string;
  reference: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  bank_account: { bank_name: string } | null;
}

interface Props {
  withdrawals: Withdrawal[];
}

export default function RecentPayouts({ withdrawals }: Props) {
  const getStatusTag = (status: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> =
      {
        completed: {
          bg: "bg-[#ecfdf5]",
          text: "text-[#059669]",
          border: "border-[#a7f3d0]",
        },
        processing: {
          bg: "bg-[#fff7ed]",
          text: "text-[#ea580c]",
          border: "border-[#fed7aa]",
        },
        pending: {
          bg: "bg-[#f0ecf4]",
          text: "text-[#5156a7]",
          border: "border-[#c7c5d3]",
        },
        failed: {
          bg: "bg-[#ffdad6]",
          text: "text-[#ba1a1a]",
          border: "border-[#fca5a5]",
        },
      };
    const style = styles[status] || styles.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      title: (
        <span className="text-xs! font-semibold uppercase tracking-wider text-on-surface-variant">
          Date
        </span>
      ),
      dataIndex: "created_at",
      render: (date: string) => (
        <Text className="text-sm! text-on-surface! font-inter">
          {dayjs(date).format("MMM DD, YYYY")}
        </Text>
      ),
    },
    {
      title: (
        <span className="text-xs! font-semibold uppercase tracking-wider text-on-surface-variant">
          Reference
        </span>
      ),
      dataIndex: "reference",
      render: (ref: string) => (
        <Text className="text-sm! text-on-surface! font-mono">{ref}</Text>
      ),
    },
    {
      title: (
        <span className="text-xs! font-semibold uppercase tracking-wider text-on-surface-variant">
          Bank
        </span>
      ),
      render: (_: any, record: Withdrawal) => (
        <Text className="text-sm! text-on-surface! font-inter">
          {record.bank_account?.bank_name || "—"}
        </Text>
      ),
    },
    {
      title: (
        <span className="text-xs! font-semibold uppercase tracking-wider text-on-surface-variant">
          Amount
        </span>
      ),
      dataIndex: "amount",
      render: (amt: number) => (
        <Text strong className="text-sm! text-primary font-inter">
          ₦{amt.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: (
        <span className="text-xs! font-semibold uppercase tracking-wider text-on-surface-variant">
          Status
        </span>
      ),
      dataIndex: "status",
      render: (status: string) => getStatusTag(status),
    },
  ];

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-6">
        <Title
          level={4}
          className="!mb-0 !text-primary !font-manrope !font-semibold"
        >
          Recent Payouts
        </Title>
        <Button
          type="link"
          className="!text-secondary !font-semibold !p-0 flex items-center gap-1 hover:!text-secondary/80"
        >
          View All <RightOutlined className="text-xs" />
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={withdrawals}
        rowKey="id"
        pagination={false}
        className="withdrawal-table"
        locale={{
          emptyText: (
            <Text className="text-on-surface-variant py-8 block text-center">
              No recent payouts
            </Text>
          ),
        }}
      />
      <style>{`
        .withdrawal-table .ant-table {
          background: transparent !important;
        }
        .withdrawal-table .ant-table-thead > tr > th {
          background: var(--surface-container) !important;
          color: var(--on-surface-variant) !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border: none !important;
          padding: 12px 16px !important;
        }
        .withdrawal-table .ant-table-thead > tr:first-child > th:first-child {
          border-radius: 8px 0 0 8px !important;
        }
        .withdrawal-table .ant-table-thead > tr:first-child > th:last-child {
          border-radius: 0 8px 8px 0 !important;
        }
        .withdrawal-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid var(--surface-container-high) !important;
          padding: 16px !important;
          background: transparent !important;
        }
        .withdrawal-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .withdrawal-table .ant-table-tbody > tr:hover > td {
          background: var(--surface-container-low) !important;
        }
      `}</style>
    </div>
  );
}
