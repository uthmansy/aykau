// app/(dashboard)/dashboard/messages/page.tsx
"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "antd";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import ConversationList from "@/components/ui/chat/ConversationList";
import ChatWindow from "@/components/ui/chat/ChatWindow";
import ChatSidebar from "@/components/ui/chat/ChatSidebar";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-4rem)] flex">
          <Skeleton active className="w-1/3 p-4" />
          <Skeleton active className="w-2/3 p-4" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const userId = useAuthStore((state) => state.user?.id);
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedId = searchParams.get("c");

  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // 🟢 STRICT GUARD: Track the last processed ID to prevent redundant calls
  const lastProcessedSelectedId = useRef<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟢 ONLY runs when selectedId is truthy AND genuinely changes (click or initial page load)
  useEffect(() => {
    if (!selectedId || !userId) return;
    if (lastProcessedSelectedId.current === selectedId) return;

    lastProcessedSelectedId.current = selectedId;

    supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", selectedId)
      .neq("sender_id", userId)
      .eq("is_read", false)
      .then(({ error }) => {
        if (error) console.error("[ERROR] Failed to mark as read:", error);
      });

    // Optimistically clear the unread count
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c))
    );
  }, [selectedId, userId]);

  useEffect(() => {
    if (!userId) return;
    fetchConversations();

    // Realtime listener for Sidebar Unread Counts ONLY
    const channel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as any;
          const currentSelectedId = selectedIdRef.current;
          const isViewingThisConvo =
            currentSelectedId === newMsg.conversation_id;

          setConversations((prev) => {
            const convoIndex = prev.findIndex(
              (c) => c.id === newMsg.conversation_id
            );
            if (convoIndex === -1) return prev;

            const updatedConvos = [...prev];
            const convo = { ...updatedConvos[convoIndex] };

            convo.last_message = newMsg;

            if (newMsg.sender_id !== userId) {
              if (isViewingThisConvo) {
                // MessageList handles the DB update, we just ensure the sidebar count is 0
                convo.unread_count = 0;
              } else {
                // User is looking elsewhere, increment unread counter
                convo.unread_count = (convo.unread_count || 0) + 1;
              }
            }

            updatedConvos[convoIndex] = convo;

            return updatedConvos.sort((a, b) => {
              const timeA = a.last_message?.created_at || a.last_message_at;
              const timeB = b.last_message?.created_at || b.last_message_at;
              return new Date(timeB).getTime() - new Date(timeA).getTime();
            });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchConversations = async () => {
    setLoading(true);

    const { data: convos } = await supabase
      .from("conversations")
      .select(
        `
        id, job_id, customer_id, artisan_id, last_message_at,
        job:job_requests(title),
        customer:profiles!customer_id(full_name, avatar_url, username, last_seen),
        artisan:profiles!artisan_id(full_name, avatar_url, username, last_seen)
      `
      )
      .or(`customer_id.eq.${userId},artisan_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (!convos || convos.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convoIds = convos.map((c) => c.id);

    let lastMessagesMap: Record<string, any> = {};
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at, sender_id")
      .in("conversation_id", convoIds)
      .order("created_at", { ascending: false });

    if (msgs) {
      msgs.forEach((m) => {
        if (!lastMessagesMap[m.conversation_id]) {
          lastMessagesMap[m.conversation_id] = m;
        }
      });
    }

    const { data: unreadMsgs } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", convoIds)
      .eq("is_read", false)
      .neq("sender_id", userId);

    const unreadCounts: Record<string, number> = {};
    if (unreadMsgs) {
      unreadMsgs.forEach((m) => {
        unreadCounts[m.conversation_id] =
          (unreadCounts[m.conversation_id] || 0) + 1;
      });
    }

    const merged = convos.map((c) => ({
      ...c,
      last_message: lastMessagesMap[c.id] || null,
      unread_count: unreadCounts[c.id] || 0,
    }));

    setConversations(merged);
    setLoading(false);
  };

  const handleSelectConversation = (id: string) => {
    router.push(`/dashboard/messages?c=${id}`);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && selectedId) {
        console.log(
          `[MessagesPage Visibility] Clearing sidebar badge for ${selectedId}`
        );

        // Optimistically clear the badge
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c))
        );

        // Ensure DB is synced
        supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", selectedId)
          .neq("sender_id", userId)
          .eq("is_read", false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [selectedId, userId]);

  if (loading && conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex bg-white">
        <Skeleton active className="w-1/3 p-4" />
        <Skeleton active className="w-2/3 p-4" />
      </div>
    );
  }

  const selectedConvo = conversations.find((c) => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white overflow-hidden">
      {/* 1. Left Sidebar: Conversation List */}
      <div className="w-full md:w-96 border-r border-gray-200 flex flex-col flex-shrink-0">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          currentUserId={userId!}
        />
      </div>

      {/* 2. Center: Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow conversation={selectedConvo} currentUserId={userId!} />
      </div>

      {/* 3. Right Sidebar: Job & Quote Context (NEW) */}
      {selectedConvo && (
        <div className="hidden lg:flex w-80 border-l border-gray-200 flex-col flex-shrink-0">
          <ChatSidebar conversation={selectedConvo} currentUserId={userId!} />
        </div>
      )}
    </div>
  );
}
