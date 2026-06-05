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
  <span className={`inline-flex ml-1.5 text-gray-50`}>
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
              className="rounded-lg overflow-hidden border border-gray-200 max-w-sm"
            >
              <img
                src={att.url}
                alt={att.name}
                className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(att.url, "_blank")}
              />
              <div
                className={`px-2 py-1.5 text-[10px] ${
                  isMe
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {att.name} • {(att.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          );
        }

        if (att.type === "pdf") {
          return (
            <a
              key={idx}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group
                ${
                  isMe
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }
              `}
            >
              <FilePdfOutlined className="text-red-500 text-2xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isMe ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {att.name}
                </p>
                <p
                  className={`text-[10px] ${
                    isMe ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {(att.size / 1024 / 1024).toFixed(2)} MB • PDF
                </p>
              </div>
              <div
                className={`p-2 rounded-full ${
                  isMe
                    ? "bg-gray-700 group-hover:bg-gray-600"
                    : "bg-white group-hover:bg-gray-200"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    isMe ? "text-gray-300" : "text-gray-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </a>
          );
        }

        // Generic document
        return (
          <a
            key={idx}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group
              ${
                isMe
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }
            `}
          >
            <FileOutlined
              className={`text-2xl flex-shrink-0 ${
                isMe ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  isMe ? "text-gray-200" : "text-gray-900"
                }`}
              >
                {att.name}
              </p>
              <p
                className={`text-[10px] ${
                  isMe ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {(att.size / 1024 / 1024).toFixed(2)} MB • Document
              </p>
            </div>
            <div
              className={`p-2 rounded-full ${
                isMe
                  ? "bg-gray-700 group-hover:bg-gray-600"
                  : "bg-white group-hover:bg-gray-200"
              }`}
            >
              <svg
                className={`w-4 h-4 ${
                  isMe ? "text-gray-300" : "text-gray-600"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
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

  // 🟢 FIX 1: Flicker-free scroll reset when switching conversations
  useEffect(() => {
    if (!loading && messagesContainerRef.current) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: "auto",
          });
        }
      });
    }
  }, [conversationId, loading]);

  // 🟢 FIX 2: OPTIMISTIC visibility update. Instantly marks as read in UI, then syncs to DB.
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log(
          `[Visibility] Tab became visible. Marking messages as read for ${conversationId}`
        );

        // 1. Optimistically update local Zustand store IMMEDIATELY
        const currentMessages =
          useChatStore.getState().messagesCache[conversationId] || [];
        const updatedMessages = currentMessages.map((msg) =>
          msg.sender_id !== currentUserId ? { ...msg, is_read: true } : msg
        );
        useChatStore.getState().setMessages(conversationId, updatedMessages);

        // 2. Sync to database in the background
        const { error } = await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", currentUserId)
          .eq("is_read", false);

        if (error) {
          console.error("[Visibility] Error marking as read in DB:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Run once on mount in case the tab is already visible
    if (document.visibilityState === "visible") {
      handleVisibilityChange();
    }

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [conversationId, currentUserId]);

  // 3. Initial Fetch
  const fetchInitialMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*,quoted_message:quoted_message_id(*)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(15);

    const reversedData = data ? data.reverse() : [];
    const cachedOlder =
      useChatStore.getState().messagesCache[conversationId] || [];
    const oldestFetched = reversedData[0];
    const validCachedOlder = oldestFetched
      ? cachedOlder.filter(
          (m: any) =>
            new Date(m.created_at).getTime() <
            new Date(oldestFetched.created_at).getTime()
        )
      : cachedOlder;

    const finalMessages = [...validCachedOlder, ...reversedData];
    useChatStore.getState().setMessages(conversationId, finalMessages);
    setHasMore(data ? data.length === 15 : false);
    setLoading(false);
  }, [conversationId]);

  // 4. Fetch Older Messages (Infinite Scroll)
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
      const reversedNewData = data.reverse();
      useChatStore.getState().prependMessages(conversationId, reversedNewData);
      setHasMore(data.length === 15);

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - previousScrollHeight;
        }
        isLoadingOlderRef.current = false;
        setIsLoadingMore(false);
      });
    } else {
      setHasMore(false);
      isLoadingOlderRef.current = false;
      setIsLoadingMore(false);
    }
  }, [conversationId, isLoadingMore, hasMore, messages]);

  // 5. Handle Scroll Event (Infinite Scroll Only)
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      if (container.scrollTop < 50 && hasMore && !isLoadingMore) {
        fetchOlderMessages();
      }
    },
    [hasMore, isLoadingMore, fetchOlderMessages]
  );

  // 6. Setup Realtime & Initial Load
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
          // 🟢 CHANGED: const to let so we can attach the quoted message
          let newMsg = payload.new as any;

          // Ultimate Guard: Prevent ghost messages
          if (newMsg.conversation_id !== conversationId) return;

          // 🟢 THE ONLY FIX: Realtime payloads are flat. If this is a reply, fetch the quoted message data
          if (newMsg.quoted_message_id) {
            const { data: quotedData } = await supabase
              .from("messages")
              .select("id, content, sender_id")
              .eq("id", newMsg.quoted_message_id)
              .maybeSingle();

            if (quotedData) {
              newMsg = { ...newMsg, quoted_message: quotedData };
            }
          }

          // If tab is visible, mark new incoming message as read instantly
          if (
            document.visibilityState === "visible" &&
            newMsg.sender_id !== currentUserId &&
            !newMsg.is_read
          ) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
            newMsg.is_read = true; // Optimistic UI
          }

          useChatStore.getState().appendMessage(conversationId, newMsg);

          // Smooth scroll to bottom if user is already near the bottom
          const container = messagesContainerRef.current;
          if (container) {
            const isNearBottom =
              container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
              150;
            if (isNearBottom) {
              requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              });
            }
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
      <div className="flex-1 flex flex-col justify-end p-4 space-y-3 bg-gray-50/30">
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
      className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30"
    >
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Spin
            indicator={<LoadingOutlined className="text-gray-400" />}
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
            id={msg.id} // 🟢 ADD THIS LINE
            className={`group relative flex ${
              isMe ? "justify-end" : "justify-start"
            }`}
          >
            {/* 🟢 Reply Button: Tucked neatly inside the bubble's top corner */}
            <button
              onClick={() => onReply(msg)}
              className={`absolute top-2 ${isMe ? "right-2" : "left-2"} 
                opacity-0 group-hover:opacity-100 transition-opacity 
                p-1.5 rounded-md bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 shadow-sm z-10`}
              title="Reply to this message"
            >
              <CommentOutlined className="text-[10px]" />
            </button>

            <div
              className={`max-w-[75%] p-3 text-sm leading-relaxed whitespace-pre-wrap break-words flex flex-col gap-1
                ${
                  isMe
                    ? "bg-gray-900 text-white rounded-2xl rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm"
                }
              `}
            >
              {quotedMsg && (
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents bubbling up to the reply button
                    const originalMsgEl = document.getElementById(quotedMsg.id);
                    if (originalMsgEl) {
                      // Smoothly scroll the original message into the center of the screen
                      originalMsgEl.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }
                    // Note: If originalMsgEl is null, it means the message is older than
                    // the currently loaded messages. We just do nothing to keep it simple.
                  }}
                  className={`mb-2 p-2 rounded-md text-xs border-l-2 flex flex-col gap-0.5 
                    cursor-pointer hover:opacity-70 transition-opacity // 🟢 ADD THESE CLASSES
                    ${
                      isMe
                        ? "bg-gray-800 border-gray-600 text-gray-300"
                        : "bg-gray-50 border-gray-300 text-gray-600"
                    }
                  `}
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
              {/* Render Attachments */}
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
