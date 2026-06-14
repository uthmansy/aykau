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
        <div className="h-[calc(100vh-64px)] flex bg-surface-container-low">
          <div className="w-full md:w-96 bg-surface-container-lowest border-r border-outline-variant/30 p-5">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <Skeleton.Input active className="w-64 h-8 mb-4 rounded-lg!" />
            <Skeleton.Input active className="w-48 h-4 rounded-lg!" />
          </div>
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

  const lastProcessedSelectedId = useRef<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c))
    );
  }, [selectedId, userId]);

  useEffect(() => {
    if (!userId) return;
    fetchConversations();

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
              convo.unread_count = isViewingThisConvo
                ? 0
                : (convo.unread_count || 0) + 1;
            }
            updatedConvos[convoIndex] = convo;
            return updatedConvos.sort(
              (a, b) =>
                new Date(
                  b.last_message?.created_at || b.last_message_at
                ).getTime() -
                new Date(
                  a.last_message?.created_at || a.last_message_at
                ).getTime()
            );
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
        `id, job_id, customer_id, artisan_id, last_message_at, job:job_requests(title), customer:profiles!customer_id(full_name, avatar_url, username, last_seen), artisan:profiles!artisan_id(full_name, avatar_url, username, last_seen)`
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
    if (msgs)
      msgs.forEach((m) => {
        if (!lastMessagesMap[m.conversation_id])
          lastMessagesMap[m.conversation_id] = m;
      });

    const { data: unreadMsgs } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", convoIds)
      .eq("is_read", false)
      .neq("sender_id", userId);
    const unreadCounts: Record<string, number> = {};
    if (unreadMsgs)
      unreadMsgs.forEach((m) => {
        unreadCounts[m.conversation_id] =
          (unreadCounts[m.conversation_id] || 0) + 1;
      });

    setConversations(
      convos.map((c) => ({
        ...c,
        last_message: lastMessagesMap[c.id] || null,
        unread_count: unreadCounts[c.id] || 0,
      }))
    );
    setLoading(false);
  };

  const handleSelectConversation = (id: string) =>
    router.push(`/dashboard/messages?c=${id}`);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && selectedId) {
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c))
        );
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
      <div className="h-[calc(100vh-64px)] flex bg-surface-container-low">
        <div className="w-full md:w-96 bg-surface-container-lowest border-r border-outline-variant/30 p-5">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Skeleton.Input active className="w-64 h-8 mb-4 rounded-lg!" />
          <Skeleton.Input active className="w-48 h-4 rounded-lg!" />
        </div>
      </div>
    );
  }

  const selectedConvo = conversations.find((c) => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-64px)] flex bg-surface-container-low overflow-hidden">
      {/* 1. Left Sidebar: Conversation List */}
      <div
        className={`${selectedId ? "hidden" : "flex"} md:flex w-full md:w-96 border-r border-outline-variant/30 flex-col flex-shrink-0 bg-surface-container-lowest`}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          currentUserId={userId!}
        />
      </div>

      {/* 2. Center: Chat Window */}
      <div
        className={`${selectedId ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0 bg-surface-container-low`}
      >
        <ChatWindow conversation={selectedConvo} currentUserId={userId!} />
      </div>

      {/* 3. Right Sidebar: Job & Quote Context */}
      {selectedConvo && (
        <div className="hidden lg:flex w-80 border-l border-outline-variant/30 flex-col flex-shrink-0 bg-surface-container-low">
          <ChatSidebar conversation={selectedConvo} currentUserId={userId!} />
        </div>
      )}
    </div>
  );
}
