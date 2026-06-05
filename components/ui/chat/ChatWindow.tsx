// components/ui/chat/ChatWindow.tsx
"use client";

import { useState } from "react";
import { Typography, Avatar, Button } from "antd";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const { Text, Title } = Typography;

interface Props {
  conversation: any | null;
  currentUserId: string;
}

export default function ChatWindow({ conversation, currentUserId }: Props) {
  // 🟢 Manage reply state HERE, in the parent component
  const [replyingTo, setReplyingTo] = useState<any>(null);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 text-center p-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <Title level={4} className="!text-gray-900 !mb-1">
          Select a conversation
        </Title>
        <Text type="secondary">
          Choose a conversation from the left to start messaging.
        </Text>
      </div>
    );
  }

  const otherPerson =
    conversation.customer_id === currentUserId
      ? conversation.artisan
      : conversation.customer;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white flex-shrink-0">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="md:hidden !p-0"
          onClick={() => window.history.back()}
        />
        <Avatar
          src={otherPerson?.avatar_url}
          icon={<UserOutlined />}
          size={40}
          className="bg-gray-200 text-gray-600"
        />
        <div className="flex-1 min-w-0">
          <Text strong className="text-sm text-gray-900 block truncate">
            {otherPerson?.full_name || otherPerson?.username}
          </Text>
          <Text className="text-xs text-gray-500 block truncate">
            {conversation.job?.title}
          </Text>
        </div>
      </div>

      {/* Messages Area (Pass the setter down) */}
      <MessageList
        conversationId={conversation.id}
        currentUserId={currentUserId}
        onReply={setReplyingTo}
      />

      {/* Input Area (Pass the state and cancel function down) */}
      <MessageInput
        conversationId={conversation.id}
        currentUserId={currentUserId}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
