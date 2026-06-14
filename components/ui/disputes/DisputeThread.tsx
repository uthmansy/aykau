"use client";

import { useEffect, useState, useRef } from "react";
import { Input, Button, Avatar, Spin, Empty } from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { TextArea } = Input;

interface Message {
  id: string;
  sender_id: string;
  content: string;
  is_admin_message: boolean;
  created_at: string;
  sender?: { full_name: string; avatar_url: string | null; role: string };
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
          const { data } = await supabase
            .from("dispute_messages")
            .select(`*, sender:sender_id(full_name, avatar_url, role)`)
            .eq("id", payload.new.id)
            .single();
          if (data) setMessages((prev) => [...prev, data as Message]);
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
        .select(`*, sender:sender_id(full_name, avatar_url, role)`)
        .eq("dispute_id", disputeId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error(error);
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
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="flex flex-col h-[600px] bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden">
      {/* Header */}
      <div className="border-b border-outline-variant/20 px-6 py-4 bg-surface-container-lowest">
        <h3 className="font-manrope text-[20px] font-semibold text-primary">
          Dispute Communication
        </h3>
        <p className="font-inter text-[14px] text-on-surface-variant mt-1">
          Discuss the dispute with the other party and admin
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-surface-container-low">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Empty
              description={
                <span className="font-inter text-on-surface-variant">
                  No messages yet. Start the conversation.
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
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
                  className={`flex-none ${isAdmin ? "bg-tertiary/20! text-tertiary!" : isOwnMessage ? "bg-primary! text-on-primary!" : "bg-surface-container-high! text-on-surface-variant!"}`}
                />

                <div
                  className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-[75%]`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`font-inter text-[12px] font-semibold ${isAdmin ? "text-tertiary" : "text-on-surface-variant"}`}
                    >
                      {msg.sender?.full_name || "Unknown"}
                    </span>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-inter text-[10px] font-bold uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                    <span className="font-inter text-[11px] text-outline">
                      {dayjs(msg.created_at).fromNow()}
                    </span>
                  </div>

                  <div
                    className={`px-4 py-3 font-inter text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
                      isAdmin
                        ? "bg-tertiary/5 border border-tertiary/20 text-tertiary rounded-2xl"
                        : isOwnMessage
                          ? "bg-primary text-on-primary rounded-2xl rounded-br-sm"
                          : "bg-surface-container-lowest text-on-surface border border-outline-variant/20 rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-outline-variant/20 px-6 py-4 bg-surface-container-lowest">
        <div className="flex gap-3 items-end">
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
            className="flex-1! bg-surface-container! border-none! rounded-lg! py-3! px-4! font-inter! text-[14px]! resize-none! focus:ring-1! focus:ring-primary/30!"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={sending}
            disabled={!newMessage.trim()}
            className="rounded-lg! h-auto! py-3! px-5! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium! mb-0!"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
