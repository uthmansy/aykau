// components/ui/disputes/DisputeThread.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Input, Button, Avatar, Typography, Spin, Empty } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  sender_id: string;
  content: string;
  is_admin_message: boolean;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
}

interface Props {
  disputeId: string;
}

export default function DisputeThread({ disputeId }: Props) {
  const userId = useAuthStore((state) => state.user?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`dispute-${disputeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dispute_messages",
          filter: `dispute_id=eq.${disputeId}`,
        },
        async (payload) => {
          // Fetch the new message with sender details
          const { data } = await supabase
            .from("dispute_messages")
            .select(
              `
              *,
              sender:sender_id(full_name, avatar_url, role)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dispute_messages")
        .select(
          `
          *,
          sender:sender_id(full_name, avatar_url, role)
        `
        )
        .eq("dispute_id", disputeId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Fetch messages error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("dispute_messages").insert({
        dispute_id: disputeId,
        sender_id: userId,
        content: newMessage.trim(),
        is_admin_message: false,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <Text strong className="text-lg">
          Dispute Communication
        </Text>
        <Text className="block text-gray-500 text-sm mt-1">
          Discuss the dispute with the other party and admin
        </Text>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <Empty
            description="No messages yet. Start the conversation."
            className="py-12"
          />
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === userId;
            const isAdmin =
              msg.is_admin_message || msg.sender?.role === "admin";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
              >
                <Avatar
                  src={msg.sender?.avatar_url}
                  icon={<UserOutlined />}
                  className={
                    isAdmin
                      ? "!bg-blue-500"
                      : isOwnMessage
                        ? "!bg-gray-700"
                        : "!bg-gray-400"
                  }
                />
                <div
                  className={`flex flex-col ${
                    isOwnMessage ? "items-end" : "items-start"
                  } max-w-[70%]`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Text
                      strong
                      className={`text-sm ${
                        isAdmin ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {msg.sender?.full_name || "Unknown"}
                      {isAdmin && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          ADMIN
                        </span>
                      )}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {dayjs(msg.created_at).fromNow()}
                    </Text>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isAdmin
                        ? "bg-blue-50 border border-blue-200"
                        : isOwnMessage
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <Text className={isOwnMessage ? "text-white" : ""}>
                      {msg.content}
                    </Text>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex gap-3">
          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="!rounded-lg"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={sending}
            disabled={!newMessage.trim()}
            className="!h-auto !rounded-lg"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
