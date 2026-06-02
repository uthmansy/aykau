// components/jobs/manage/QuoteDetailModal.tsx
"use client";

import {
  Modal,
  Avatar,
  Typography,
  Tag,
  Divider,
  Button,
  Space,
  message,
  Descriptions,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  UserOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

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
  const artisan = quote.artisan;

  const handleStatusUpdate = async (newStatus: "accepted" | "declined") => {
    const { error } = await supabase
      .from("job_quotes")
      .update({ status: newStatus })
      .eq("id", quote.id);

    if (error) {
      message.error(`Failed to ${newStatus} quote.`);
    } else {
      message.success(`Quote ${newStatus} successfully!`);
      onActionComplete(); // Refresh the list
      onClose();
    }
  };

  const handleRespond = () => {
    // Dummy action for now
    message.info(
      "Chat feature coming soon! You'll be able to discuss details directly here."
    );
  };

  const isActionable =
    quote.status === "pending" || quote.status === "responded";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={600}
      footer={
        isActionable ? (
          <div className="flex justify-end gap-2 mt-4">
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusUpdate("declined")}
            >
              Decline
            </Button>
            <Button
              type="primary"
              ghost
              icon={<MessageOutlined />}
              onClick={handleRespond}
            >
              Respond / Chat
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusUpdate("accepted")}
            >
              Accept Quote
            </Button>
          </div>
        ) : null
      }
    >
      {/* Artisan Profile Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
        <Avatar size={64} src={artisan?.avatar_url} icon={<UserOutlined />} />
        <div>
          <Title level={4} className="mb-0! flex items-center gap-2">
            {artisan?.full_name || artisan?.username}
            {artisan?.is_verified && (
              <Tag color="green" className="text-xs">
                Verified
              </Tag>
            )}
          </Title>
          <Text type="secondary">
            Submitted on {new Date(quote.created_at).toLocaleDateString()}
          </Text>
        </div>
        <Tag
          color={
            quote.status === "accepted"
              ? "green"
              : quote.status === "declined"
              ? "red"
              : "blue"
          }
          className="ml-auto text-sm py-1 px-3 rounded-full"
        >
          {quote.status.toUpperCase()}
        </Tag>
      </div>

      {/* Quote Details */}
      <div className="space-y-4">
        <div>
          <Text strong className="block mb-1 text-xs uppercase text-gray-500">
            Quoted Price
          </Text>
          <Title level={3} className="mb-0! text-blue-600">
            {quote.quoted_price
              ? `₦${Number(quote.quoted_price).toLocaleString()}`
              : "Not specified"}
          </Title>
          {quote.quoted_price_note && (
            <Text type="secondary" className="block mt-1">
              {quote.quoted_price_note}
            </Text>
          )}
        </div>

        {quote.availability_note && (
          <div>
            <Text strong className="block mb-1 text-xs uppercase text-gray-500">
              Availability
            </Text>
            <Text>{quote.availability_note}</Text>
          </div>
        )}

        <Divider className="my-4!" />

        <div>
          <Text strong className="block mb-2 text-xs uppercase text-gray-500">
            Cover Letter
          </Text>
          <Paragraph className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap mb-0!">
            {quote.message}
          </Paragraph>
        </div>

        {quote.portfolio_links?.length > 0 && (
          <div>
            <Text strong className="block mb-2 text-xs uppercase text-gray-500">
              Portfolio Links
            </Text>
            <div className="space-y-2">
              {quote.portfolio_links.map((link: string, idx: number) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                >
                  <LinkOutlined /> {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
