// hooks/useRealtimeNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
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
        .limit(50);

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

    // ✅ THE FIX: Generate a unique ID for this specific subscription instance.
    // This prevents collisions if React Strict Mode/Turbopack remounts the component
    // before the async cleanup finishes, OR if this hook is used in multiple components.
    const uniqueSubId = Math.random().toString(36).substring(2, 9);
    const channelName = `notifications-realtime:${userId}:${uniqueSubId}`;

    const channel = supabase
      .channel(channelName)
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
      // Listen for UPDATES
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

          // ✅ Using functional updater to avoid stale closures
          setNotifications((prev) => {
            const oldNotification = prev.find(
              (n) => n.id === updatedNotification.id
            );

            if (
              oldNotification &&
              oldNotification.is_read !== updatedNotification.is_read
            ) {
              if (updatedNotification.is_read) {
                setUnreadCount((c) => Math.max(0, c - 1));
              } else {
                setUnreadCount((c) => c + 1);
              }
            }

            return prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]); // <--- Dependency array remains clean

  // 3. Helper: Mark as Read (Optimistic UI)
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

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
