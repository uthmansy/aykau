// components/ui/chat/ChatSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, Typography, Tag, Button, Divider, App, Skeleton } from "antd";
import {
  WalletOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  DollarOutlined,
  SendOutlined,
  FlagOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

const { Title, Text } = Typography;

interface Props {
  conversation: any;
  currentUserId: string;
}

export default function ChatSidebar({ conversation, currentUserId }: Props) {
  const { message } = App.useApp();
  const [job, setJob] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isCustomer = conversation.customer_id === currentUserId;
  const isArtisan = conversation.artisan_id === currentUserId;

  useEffect(() => {
    if (!conversation?.job_id) return;
    fetchData();
  }, [conversation?.job_id, conversation?.artisan_id]);

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Job Details
    const { data: jobData } = await supabase
      .from("job_requests")
      .select("*")
      .eq("id", conversation.job_id)
      .single();

    setJob(jobData);

    // 2. Fetch the specific Quote for this conversation's artisan
    const { data: quoteData } = await supabase
      .from("job_quotes")
      .select("*")
      .eq("job_id", conversation.job_id)
      .eq("artisan_id", conversation.artisan_id)
      .maybeSingle();

    setQuote(quoteData);
    setLoading(false);
  };

  const handleQuoteStatusUpdate = async (
    newStatus: "accepted" | "declined" | "withdrawn"
  ) => {
    if (!quote) return;

    const { error } = await supabase
      .from("job_quotes")
      .update({ status: newStatus })
      .eq("id", quote.id);

    if (error) {
      // 🟢 Catch the specific database trigger error
      if (
        error.code === "P0001" &&
        error.message.includes("job_already_filled")
      ) {
        message.warning(
          "This job has already been assigned to another artisan."
        );
      } else {
        message.error(`Failed to ${newStatus} quote.`);
      }
      console.error(`[ChatSidebar] Error updating quote status:`, error);
    } else {
      message.success(`Quote ${newStatus} successfully!`);
      // Refresh the sidebar data so the UI and buttons update immediately
      fetchData();
    }
  };

  // 🟡 DUMMY ACTION: For payment and completion features
  const handleDummyAction = (action: string) => {
    message.info(`"${action}" feature is coming soon!`);
  };

  // Map status to AntD colors (Strictly avoiding blue)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "success"; // Green
      case "declined":
        return "error"; // Red
      case "responded":
        return "warning"; // Orange
      case "withdrawn":
        return "default"; // Gray
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No job details found for this conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-gray-50/30">
      {/* 1. Job Details Card */}
      <Card
        className="!rounded-xl !shadow-sm !border-gray-200 !bg-white"
        styles={{ body: { padding: "16px" } }}
      >
        <div className="flex items-center gap-2 mb-3">
          <RiseOutlined className="text-gray-500" />
          <Text
            strong
            className="text-xs text-gray-500 uppercase tracking-wide"
          >
            Job Details
          </Text>
        </div>
        <Title level={5} className="!mb-3 !text-gray-900 !leading-snug">
          {job.title || job.subcategory}
        </Title>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <Text type="secondary" className="!text-xs">
              Status
            </Text>
            <Tag
              color={job.status === "open" ? "success" : "default"}
              className="!rounded-full !text-[10px] !uppercase !m-0"
            >
              {job.status}
            </Tag>
          </div>
          <div className="flex justify-between items-center">
            <Text type="secondary" className="!text-xs">
              Budget
            </Text>
            <Text strong className="!text-gray-900 !text-xs">
              {job.budget}
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text type="secondary" className="!text-xs">
              Urgency
            </Text>
            <Text className="!text-gray-700 !text-xs capitalize">
              {job.urgency?.replace("-", " ")}
            </Text>
          </div>
        </div>
      </Card>

      {/* 2. Quote Details & Actions Card */}
      {quote && (
        <Card
          className="!rounded-xl !shadow-sm !border-gray-200 !bg-white"
          styles={{ body: { padding: "16px" } }}
        >
          <div className="flex items-center gap-2 mb-3">
            <WalletOutlined className="text-gray-500" />
            <Text
              strong
              className="text-xs text-gray-500 uppercase tracking-wide"
            >
              Quote Details
            </Text>
          </div>

          <div className="mb-1">
            <Text type="secondary" className="!text-xs">
              Quoted Price
            </Text>
            <Title level={4} className="!mb-0 !text-gray-900 !font-bold">
              {quote.quoted_price
                ? `₦${Number(quote.quoted_price).toLocaleString()}`
                : "Negotiable"}
            </Title>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Text type="secondary" className="!text-xs">
              Status
            </Text>
            <Tag
              color={getStatusColor(quote.status)}
              className="!rounded-full !text-[10px] !uppercase !m-0"
            >
              {quote.status}
            </Tag>
          </div>

          <Divider className="!my-3 !border-gray-100" />

          {/* 3. Dynamic Actions based on Role and Status */}
          <div className="space-y-2">
            {/* CUSTOMER ACTIONS: Quote is pending/responded */}
            {isCustomer &&
              (quote.status === "pending" || quote.status === "responded") && (
                <>
                  <Button
                    block
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleQuoteStatusUpdate("accepted")}
                    className="!rounded-lg !bg-gray-900 hover:!bg-gray-800 !border-0 !h-9 !text-sm"
                  >
                    Accept Quote
                  </Button>
                  <Button
                    block
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleQuoteStatusUpdate("declined")}
                    className="!rounded-lg !h-9 !text-sm"
                  >
                    Decline Quote
                  </Button>
                </>
              )}

            {/* ARTISAN ACTIONS: Quote is pending */}
            {isArtisan && quote.status === "pending" && (
              <Button
                block
                icon={<UndoOutlined />}
                onClick={() => handleQuoteStatusUpdate("withdrawn")}
                className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-gray-500 !h-9 !text-sm"
              >
                Withdraw Quote
              </Button>
            )}

            {/* SHARED ACTIONS: Quote is accepted */}
            {quote.status === "accepted" && (
              <>
                <Text
                  strong
                  className="text-[10px] text-gray-400 uppercase tracking-wide block mb-2"
                >
                  Payment & Completion
                </Text>

                {isCustomer && (
                  <Button
                    block
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => handleDummyAction("Send Payment")}
                    className="!rounded-lg !bg-gray-900 hover:!bg-gray-800 !border-0 !h-9 !text-sm"
                  >
                    Send Payment
                  </Button>
                )}

                {isArtisan && (
                  <Button
                    block
                    icon={<DollarOutlined />}
                    onClick={() => handleDummyAction("Request Payment")}
                    className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-gray-500 !h-9 !text-sm"
                  >
                    Request Payment
                  </Button>
                )}

                <Button
                  block
                  icon={<FlagOutlined />}
                  onClick={() => handleDummyAction("Mark Job as Complete")}
                  className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-gray-500 !h-9 !text-sm"
                >
                  Mark Job as Complete
                </Button>
              </>
            )}

            {/* Fallback if no actions are available */}
            {quote.status === "declined" && (
              <div className="text-center py-2">
                <Text type="secondary" className="!text-xs italic">
                  This quote was declined.
                </Text>
              </div>
            )}

            {quote.status === "withdrawn" && (
              <div className="text-center py-2">
                <Text type="secondary" className="!text-xs italic">
                  This quote was withdrawn.
                </Text>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
