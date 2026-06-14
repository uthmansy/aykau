// components/ui/chat/MessageList.tsx
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { Skeleton, Spin } from "antd";
import {
  CheckOutlined,
  LoadingOutlined,
  CommentOutlined,
  FilePdfOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { useChatStore } from "@/store/chat.store";

const ReadReceipt = ({ isRead }: { isRead: boolean }) => (
  <span className="inline-flex ml-1.5 text-white/80">
    {" "}
    {isRead && <CheckOutlined className="text-[10px] -mr-1.5" />}
    <CheckOutlined className="text-[10px]" />
  </span>
);

const EMPTY_MESSAGES: any[] = [];

const AttachmentRenderer = ({
  attachments,
  isMe,
}: {
  attachments: any[];
  isMe: boolean;
}) => {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="space-y-2 mt-2">
      {attachments.map((att: any, idx: number) => {
        if (att.type === "image") {
          return (
            <div
              key={idx}
              className="rounded-lg overflow-hidden border border-outline-variant/20 max-w-sm"
            >
              <img
                src={att.url}
                alt={att.name}
                className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(att.url, "_blank")}
              />
              <div
                className={`px-2 py-1.5 text-[10px] font-inter ${isMe ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant"}`}
              >
                {att.name} • {(att.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          );
        }
        return (
          <a
            key={idx}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group ${isMe ? "bg-primary-container border-primary-container/20 hover:bg-primary-container/80" : "bg-surface-container border-outline-variant/20 hover:bg-surface-container-high"}`}
          >
            <FilePdfOutlined className="text-error text-2xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p
                className={`font-inter text-[14px] font-medium truncate ${isMe ? "text-on-primary-container" : "text-on-surface"}`}
              >
                {att.name}
              </p>
              <p
                className={`font-inter text-[10px] ${isMe ? "text-on-primary-container/70" : "text-on-surface-variant"}`}
              >
                {(att.size / 1024 / 1024).toFixed(2)} MB • PDF
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
};

interface Props {
  conversationId: string;
  currentUserId: string;
  onReply: (msg: any) => void;
}

export default function MessageList({
  conversationId,
  currentUserId,
  onReply,
}: Props) {
  const messages = useChatStore(
    (state) => state.messagesCache[conversationId] ?? EMPTY_MESSAGES
  );
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingOlderRef = useRef(false);

  useEffect(() => {
    if (!loading && messagesContainerRef.current) {
      requestAnimationFrame(() => {
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "auto",
        });
      });
    }
  }, [conversationId, loading]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        const currentMessages =
          useChatStore.getState().messagesCache[conversationId] || [];
        const updatedMessages = currentMessages.map((msg) =>
          msg.sender_id !== currentUserId ? { ...msg, is_read: true } : msg
        );
        useChatStore.getState().setMessages(conversationId, updatedMessages);
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", currentUserId)
          .eq("is_read", false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (document.visibilityState === "visible") handleVisibilityChange();
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [conversationId, currentUserId]);

  const fetchInitialMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*,quoted_message:quoted_message_id(*)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(15);
    const reversedData = data ? data.reverse() : [];
    useChatStore.getState().setMessages(conversationId, reversedData);
    setHasMore(data ? data.length === 15 : false);
    setLoading(false);
  }, [conversationId]);

  const fetchOlderMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore || messages.length === 0) return;
    setIsLoadingMore(true);
    isLoadingOlderRef.current = true;
    const container = messagesContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;
    const oldestMessage = messages[0];
    const { data } = await supabase
      .from("messages")
      .select("*,quoted_message:quoted_message_id(*)")
      .eq("conversation_id", conversationId)
      .lt("created_at", oldestMessage.created_at)
      .order("created_at", { ascending: false })
      .limit(15);
    if (data && data.length > 0) {
      useChatStore.getState().prependMessages(conversationId, data.reverse());
      setHasMore(data.length === 15);
      requestAnimationFrame(() => {
        if (container)
          container.scrollTop = container.scrollHeight - previousScrollHeight;
        isLoadingOlderRef.current = false;
        setIsLoadingMore(false);
      });
    } else {
      setHasMore(false);
      isLoadingOlderRef.current = false;
      setIsLoadingMore(false);
    }
  }, [conversationId, isLoadingMore, hasMore, messages]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop < 50 && hasMore && !isLoadingMore)
        fetchOlderMessages();
    },
    [hasMore, isLoadingMore, fetchOlderMessages]
  );

  useEffect(() => {
    fetchInitialMessages();
    const channel = supabase
      .channel(`chat-realtime-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          let newMsg = payload.new as any;
          if (newMsg.conversation_id !== conversationId) return;
          if (newMsg.quoted_message_id) {
            const { data: quotedData } = await supabase
              .from("messages")
              .select("id, content, sender_id")
              .eq("id", newMsg.quoted_message_id)
              .maybeSingle();
            if (quotedData) newMsg = { ...newMsg, quoted_message: quotedData };
          }
          if (
            document.visibilityState === "visible" &&
            newMsg.sender_id !== currentUserId &&
            !newMsg.is_read
          ) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
            newMsg.is_read = true;
          }
          useChatStore.getState().appendMessage(conversationId, newMsg);
          const container = messagesContainerRef.current;
          if (
            container &&
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
              150
          ) {
            requestAnimationFrame(() =>
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          useChatStore
            .getState()
            .updateMessage(conversationId, payload.new.id, payload.new);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, fetchInitialMessages]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-end p-4 space-y-3 bg-surface-container-low">
        <Skeleton.Input active className="w-1/3 h-4 rounded-lg self-end" />
        <Skeleton.Input active className="w-1/2 h-4 rounded-lg self-start" />
        <Skeleton.Input active className="w-1/4 h-4 rounded-lg self-end" />
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-low"
    >
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Spin
            indicator={<LoadingOutlined className="text-outline" />}
            size="small"
          />
        </div>
      )}

      {messages.map((msg) => {
        const isMe = msg.sender_id === currentUserId;
        const quotedMsg = msg.quoted_message;
        return (
          <div
            key={msg.id}
            id={msg.id}
            className={`group relative flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <button
              onClick={() => onReply(msg)}
              className={`absolute top-2 ${isMe ? "right-2" : "left-2"} opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-surface-glass backdrop-blur-glass border border-white/20 text-on-surface-variant hover:text-primary shadow-sm z-10`}
            >
              <CommentOutlined className="text-[10px]" />
            </button>

            <div
              className={`max-w-[75%] p-3 text-[14px] leading-relaxed whitespace-pre-wrap break-words flex flex-col gap-1 font-inter
              ${isMe ? "bg-primary text-white rounded-2xl rounded-br-sm" : "bg-surface-container-lowest text-on-surface border border-outline-variant/20 rounded-2xl rounded-bl-sm"}`}
            >
              {quotedMsg && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = document.getElementById(quotedMsg.id);
                    if (el)
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                  className={`mb-2 p-2 rounded-lg text-[12px] border-l-2 flex flex-col gap-0.5 cursor-pointer hover:opacity-70 transition-opacity 
                  ${isMe ? "bg-primary-container/20 border-primary-container text-on-primary-container" : "bg-surface-container border-outline-variant text-on-surface-variant"}`}
                >
                  <span className="font-semibold opacity-80 text-[10px] uppercase tracking-wide">
                    {quotedMsg.sender_id === currentUserId ? "You" : "Them"}
                  </span>
                  <span className="line-clamp-2 opacity-90 leading-snug">
                    {quotedMsg.content || "📎 Attachment"}
                  </span>
                </div>
              )}

              <div className="flex items-end gap-1">
                <span>{msg.content || "📎 Attachment"}</span>
                {isMe && <ReadReceipt isRead={msg.is_read} />}
              </div>
              {msg.attachments && (
                <AttachmentRenderer attachments={msg.attachments} isMe={isMe} />
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
