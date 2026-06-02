"use client";

import { getStatusConfig } from "@/lib/helpers/quotes";
import { Button, Card, Divider, Tag, Typography, Input } from "antd";
import { EditOutlined, LinkOutlined } from "@ant-design/icons";
import { Dispatch, SetStateAction } from "react";

const { Text, Paragraph } = Typography;

interface Props {
  myQuote: any;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}

export default function QuoteDetailView({ myQuote, setIsEditing }: Props) {
  const statusConfig = getStatusConfig(myQuote.status);
  const canEdit = myQuote.status === "pending"; // Only allow editing if not responded/accepted/declined

  return (
    <Card
      title={
        <span className="font-semibold text-gray-900">
          Your Submitted Quote
        </span>
      }
      className="rounded-xl shadow-sm border-gray-100"
      styles={{
        body: { padding: "24px" },
        header: { borderBottom: "1px solid #f3f4f6", padding: "16px 24px" },
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <Tag
          icon={statusConfig.icon}
          color={statusConfig.color}
          className="text-sm py-1 px-3 rounded-full font-medium"
        >
          {statusConfig.label}
        </Tag>
        <Text type="secondary" className="text-sm">
          Submitted {new Date(myQuote.created_at).toLocaleDateString()}
        </Text>
      </div>

      <div className="space-y-6">
        {/* Message */}
        <div>
          <Text
            strong
            className="block mb-2 text-xs uppercase text-gray-500 tracking-wide"
          >
            Cover Letter / Message
          </Text>
          <Paragraph className="mb-0! text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
            {myQuote.message}
          </Paragraph>
        </div>

        {/* Price & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <Text
              strong
              className="block mb-1 text-xs uppercase text-gray-500 tracking-wide"
            >
              Quoted Price
            </Text>
            <Text className="text-xl font-bold text-gray-900">
              {myQuote.quoted_price
                ? `₦ ${Number(myQuote.quoted_price).toLocaleString()}`
                : "Not specified"}
            </Text>
            {myQuote.quoted_price_note && (
              <Paragraph className="mt-2! mb-0! text-sm text-gray-600">
                {myQuote.quoted_price_note}
              </Paragraph>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <Text
              strong
              className="block mb-1 text-xs uppercase text-gray-500 tracking-wide"
            >
              Availability
            </Text>
            <Text className="text-gray-900">
              {myQuote.availability_note || "Not specified"}
            </Text>
          </div>
        </div>

        {/* Portfolio */}
        {myQuote.portfolio_links?.length > 0 && (
          <div>
            <Text
              strong
              className="block mb-2 text-xs uppercase text-gray-500 tracking-wide"
            >
              Portfolio Links
            </Text>
            <div className="space-y-2">
              {myQuote.portfolio_links.map((link: string, idx: number) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 break-all"
                >
                  <LinkOutlined /> {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <Divider className="my-6!" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Text type="secondary" className="text-sm">
          {canEdit
            ? "You can still edit this quote while it's pending review."
            : "This quote has been processed and can no longer be edited."}
        </Text>
        {canEdit && (
          <Button
            type="primary"
            onClick={() => setIsEditing(true)}
            icon={<EditOutlined />}
            className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
          >
            Edit Quote
          </Button>
        )}
      </div>
    </Card>
  );
}
