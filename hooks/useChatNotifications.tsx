// hooks/useChatNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

export function useChatNotifications() {
  const userId = useAuthStore((state) => state.user?.id);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the exact count of unread messages
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    // Get all conversation IDs the user is part of
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`customer_id.eq.${userId},artisan_id.eq.${userId}`);

    if (!conversations || conversations.length === 0) {
      setUnreadMessageCount(0);
      setLoading(false);
      return;
    }

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages in those conversations (excluding the user's own messages)
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .eq("is_read", false)
      .neq("sender_id", userId);

    setUnreadMessageCount(count || 0);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchUnreadCount();
    if (!userId) return;

    // 2. Realtime listener for Chat
    const channel = supabase
      .channel("chat-notifications-realtime")
      // Listen for NEW messages
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as any;
          // If it's from someone else and unread, increment the badge
          if (newMessage.sender_id !== userId && !newMessage.is_read) {
            setUnreadMessageCount((prev) => prev + 1);
          }
        }
      )
      // Listen for UPDATES (e.g., when a conversation is marked as read)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          // Refetch to ensure 100% accuracy when messages are marked as read
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchUnreadCount]);

  // 3. Helper: Mark all messages in a specific conversation as read
  const markConversationAsRead = useCallback(
    async (conversationId: string) => {
      if (!userId) return;

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId) // Don't update the user's own messages
        .eq("is_read", false);

      // Refresh the count
      fetchUnreadCount();
    },
    [userId, fetchUnreadCount]
  );

  return {
    unreadMessageCount,
    loading,
    markConversationAsRead,
    refresh: fetchUnreadCount,
  };
}
