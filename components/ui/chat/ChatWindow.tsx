"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Drawer } from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatSidebar from "./ChatSidebar";

interface Props {
  conversation: any | null;
  currentUserId: string;
}

export default function ChatWindow({ conversation, currentUserId }: Props) {
  const router = useRouter();
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-low text-center p-8">
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-primary"
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
        <h3 className="font-manrope text-[20px] font-semibold text-primary mb-1">
          Select a conversation
        </h3>
        <p className="font-inter text-[14px] text-on-surface-variant">
          Choose a conversation from the left to start messaging.
        </p>
      </div>
    );
  }

  const otherPerson =
    conversation.customer_id === currentUserId
      ? conversation.artisan
      : conversation.customer;

  return (
    <>
      <div className="flex flex-col h-full bg-surface-container-low">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex-shrink-0">
          {/* Back Button (Mobile Only) */}
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="md:hidden! p-0! text-on-surface-variant hover:text-primary!"
            onClick={() => router.push("/dashboard/messages")}
          />

          <Avatar
            src={otherPerson?.avatar_url}
            icon={<UserOutlined />}
            size={40}
            className="bg-surface-container text-on-surface-variant ring-2 ring-outline-variant/20"
          />

          <div className="flex-1 min-w-0">
            <span className="font-inter text-[14px] font-semibold text-on-surface block truncate">
              {otherPerson?.full_name || otherPerson?.username}
            </span>
            <span className="font-inter text-[12px] text-on-surface-variant block truncate">
              {conversation.job?.title}
            </span>
          </div>

          {/* ✅ NEW: Job Details Button (Mobile Only) */}
          <Button
            type="text"
            icon={<InfoCircleOutlined className="text-[20px]" />}
            className="lg:hidden! p-0! text-on-surface-variant hover:text-primary!"
            onClick={() => setIsDetailsOpen(true)}
            title="View Job Details & Actions"
          />
        </div>

        {/* Messages Area */}
        <MessageList
          conversationId={conversation.id}
          currentUserId={currentUserId}
          onReply={setReplyingTo}
        />

        {/* Input Area */}
        <MessageInput
          conversationId={conversation.id}
          currentUserId={currentUserId}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>

      {/* ✅ NEW: Mobile Drawer for Chat Sidebar */}
      <Drawer
        title="Job Details & Actions"
        placement="right"
        onClose={() => setIsDetailsOpen(false)}
        open={isDetailsOpen}
        width="100%" // Full width on mobile for better usability
        styles={{
          body: { padding: 0, backgroundColor: "var(--surface-container-low)" },
          header: {
            borderBottom: "1px solid var(--outline-variant)",
            backgroundColor: "var(--surface-container-lowest)",
            padding: "16px 20px",
          },
          // Rounded top corners for a modern mobile sheet feel
          wrapper: { borderRadius: "16px 0 0 0", overflow: "hidden" },
        }}
      >
        <ChatSidebar
          conversation={conversation}
          currentUserId={currentUserId}
        />
      </Drawer>
    </>
  );
}
