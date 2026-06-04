// hooks/useRealtimeNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client"; // Adjust path
import { Notification } from "@/types/db";

export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Initial Data
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50); // Limit for performance

      if (!error && data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [userId]);

  // 2. Subscribe to Realtime Changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-realtime:${userId}`)
      // Listen for NEW notifications
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      // Listen for UPDATES (e.g., marked as read from another device)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );

          // Recalculate unread count if status changed
          const oldNotification = notifications.find(
            (n) => n.id === updatedNotification.id
          );
          if (
            oldNotification &&
            oldNotification.is_read !== updatedNotification.is_read
          ) {
            if (updatedNotification.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            } else {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, notifications]);

  // 3. Helper: Mark as Read (Optimistic UI)
  const markAsRead = useCallback(async (id: string) => {
    // Update UI immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Update Database
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }, []);

  // 4. Helper: Mark All as Read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
