// components/jobs/manage/QuoteDetailModal.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal, Avatar, Typography, Tag, Button, Space, App } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  UserOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

const { Title, Text, Paragraph } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  quote: any;
  onActionComplete: () => void;
}

export default function QuoteDetailModal({
  open,
  onClose,
  quote,
  onActionComplete,
}: Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);
  const artisan = quote.artisan;

  // 1. Mark quote as viewed when the modal opens
  useEffect(() => {
    if (open && quote && !quote.is_viewed) {
      const markAsViewed = async () => {
        await supabase
          .from("job_quotes")
          .update({
            is_viewed: true,
            viewed_at: new Date().toISOString(),
          })
          .eq("id", quote.id);

        // Refresh the parent list so the unread dot disappears
        onActionComplete();
      };
      markAsViewed();
    }
  }, [open, quote?.id, quote?.is_viewed]);

  const handleStatusUpdate = async (newStatus: "accepted" | "declined") => {
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
    } else {
      message.success(`Quote ${newStatus} successfully!`);
      onActionComplete();
      onClose();
    }
  };

  // 2. Handle Chat/Message Button Click
  const handleRespond = async () => {
    if (!userId) {
      message.error("You must be logged in to start a chat.");
      return;
    }

    const jobId = quote.job_id;
    const artisanId = quote.artisan_id;

    // Check if a conversation already exists for this job and artisan
    const { data: existingConvo } = await supabase
      .from("conversations")
      .select("id")
      .eq("job_id", jobId)
      .eq("artisan_id", artisanId)
      .eq("customer_id", userId)
      .maybeSingle();

    let conversationId = existingConvo?.id;

    // If not, create a new conversation
    if (!conversationId) {
      const { data: newConvo, error } = await supabase
        .from("conversations")
        .insert({
          job_id: jobId,
          customer_id: userId,
          artisan_id: artisanId,
        })
        .select("id")
        .single();

      if (error || !newConvo) {
        message.error("Failed to start conversation.");
        console.error("Conversation creation error:", error);
        return;
      }
      conversationId = newConvo.id;
    }

    // Close the modal and navigate to the chat
    onClose();
    router.push(`/dashboard/messages?c=${conversationId}`);
  };

  const isActionable =
    quote.status === "pending" || quote.status === "responded";

  // Map status to standard AntD colors (Strictly avoiding blue/processing)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "success"; // Green
      case "declined":
        return "error"; // Red
      case "responded":
        return "warning"; // Orange
      default:
        return "default"; // Gray
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={640}
      title="Quote Details"
      destroyOnHidden
      footer={
        isActionable ? (
          <div className="flex justify-between items-center pt-2">
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusUpdate("declined")}
              className="rounded-md"
            >
              Decline
            </Button>
            <Space>
              <Button
                icon={<MessageOutlined />}
                onClick={handleRespond}
                className="rounded-md"
              >
                Message
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusUpdate("accepted")}
                className="rounded-md"
              >
                Accept Quote
              </Button>
            </Space>
          </div>
        ) : null
      }
    >
      {/* 1. Artisan Profile Header */}
      <div className="flex items-center gap-4 pb-5 mb-6 border-b border-gray-100">
        <Avatar
          size={56}
          src={artisan?.avatar_url}
          icon={<UserOutlined />}
          className="border border-gray-200 bg-gray-100"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Title level={5} className="mb-0! text-gray-900! truncate">
              {artisan?.full_name || artisan?.username || "Artisan"}
            </Title>
            {artisan?.is_verified && (
              <Tag
                color="success"
                bordered={false}
                className="text-xs! px-2! rounded-full! flex items-center gap-1"
              >
                <CheckCircleOutlined /> Verified
              </Tag>
            )}
          </div>
          <Text type="secondary" className="text-xs!">
            Submitted on{" "}
            {new Date(quote.created_at).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </div>
        <Tag
          color={getStatusColor(quote.status)}
          className="rounded-full! px-3! py-0.5! text-xs! font-medium uppercase"
        >
          {quote.status}
        </Tag>
      </div>

      {/* 2. Price & Availability Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <Text
            type="secondary"
            className="text-xs! uppercase font-medium tracking-wide block mb-1"
          >
            Quoted Price
          </Text>
          <Title level={4} className="mb-0! text-gray-900! font-bold">
            {quote.quoted_price
              ? `₦${Number(quote.quoted_price).toLocaleString()}`
              : "Negotiable"}
          </Title>
          {quote.quoted_price_note && (
            <Text className="text-xs! text-gray-500! block mt-1.5 line-clamp-2">
              {quote.quoted_price_note}
            </Text>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <Text
            type="secondary"
            className="text-xs! uppercase font-medium tracking-wide block mb-1"
          >
            Availability
          </Text>
          <Text className="text-base! text-gray-800! font-medium block mt-0.5">
            {quote.availability_note || "Not specified"}
          </Text>
        </div>
      </div>

      {/* 3. Cover Letter / Message */}
      <div className="mb-6">
        <Text
          strong
          className="text-xs! uppercase text-gray-500! tracking-wide block mb-2"
        >
          Proposal Message
        </Text>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <Paragraph className="mb-0! text-gray-700! text-[14px]! leading-relaxed whitespace-pre-wrap">
            {quote.message}
          </Paragraph>
        </div>
      </div>

      {/* 4. Portfolio Links */}
      {quote.portfolio_links?.length > 0 && (
        <div>
          <Text
            strong
            className="text-xs! uppercase text-gray-500! tracking-wide block mb-3"
          >
            Portfolio Links
          </Text>
          <div className="space-y-2">
            {quote.portfolio_links.map((link: string, idx: number) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors group"
              >
                <LinkOutlined className="text-gray-400! group-hover:text-gray-600! transition-colors" />
                <span className="text-sm! text-gray-700! group-hover:text-gray-900! truncate flex-1 transition-colors">
                  {link}
                </span>
                <LinkOutlined className="text-gray-300! group-hover:text-gray-500! transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
