// components/ui/chat/MessageList.tsx
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { Skeleton, Spin } from "antd";
import { CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { useChatStore } from "@/store/chat.store";

const ReadReceipt = ({ isRead }: { isRead: boolean }) => (
  <span
    className={`inline-flex ml-1.5 ${
      isRead ? "text-gray-900" : "text-gray-400"
    }`}
  >
    <CheckOutlined className="text-[10px] -mr-1.5" />
    <CheckOutlined className="text-[10px]" />
  </span>
);

const EMPTY_MESSAGES: any[] = [];

interface Props {
  conversationId: string;
  currentUserId: string;
}

export default function MessageList({ conversationId, currentUserId }: Props) {
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
      .select("*")
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
      .select("*")
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
          const newMsg = payload.new as any;

          // Ultimate Guard: Prevent ghost messages
          if (newMsg.conversation_id !== conversationId) return;

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
        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] p-3 text-sm leading-relaxed whitespace-pre-wrap break-words flex items-end gap-1
                ${
                  isMe
                    ? "bg-gray-900 text-white rounded-2xl rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm"
                }
              `}
            >
              <span>{msg.content || "📎 Attachment"}</span>
              {isMe && <ReadReceipt isRead={msg.is_read} />}
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
