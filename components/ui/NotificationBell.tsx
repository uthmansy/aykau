// components/layout/NotificationBell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Dropdown, App, Avatar } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuthStore } from "@/store/auth.store";

// Helper to format timestamps cleanly
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useRealtimeNotifications(userId);

  const { notification } = App.useApp();
  const prevCountRef = useRef(unreadCount);

  // 1. Control the dropdown open state
  const [isOpen, setIsOpen] = useState(false);

  // Show Toast when a new notification arrives in realtime
  useEffect(() => {
    if (userId && unreadCount > prevCountRef.current && unreadCount > 0) {
      const latest = notifications[0];
      if (latest) {
        notification.info({
          title: latest.title,
          description: latest.message,
          placement: "topRight",
          duration: 4.5,
        });
      }
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, notifications, notification, userId]);

  // 2. Handle click: Mark as read, close dropdown instantly, then navigate
  const handleItemClick = (item: any) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    if (item.link) {
      setIsOpen(false); // Instant feedback: dropdown closes immediately
      router.push(item.link);
    }
  };

  // 3. Ultra-clean Dropdown Content
  const dropdownContent = (
    <div className="w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200/60 overflow-hidden ring-1 ring-black/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <span className="text-sm font-semibold text-gray-900 tracking-tight">
          Notifications
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[11px] font-medium text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100"
          >
            <CheckOutlined className="text-[10px]" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-112 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <BellOutlined className="text-xl text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">
              You have no new notifications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100/80">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-start gap-3 p-4 transition-colors cursor-pointer
                  ${
                    !item.is_read
                      ? "bg-gray-50/60 hover:bg-gray-100/80"
                      : "bg-white hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  {/* Title Row with Unread Dot */}
                  <div className="flex items-center gap-2 mb-1">
                    {!item.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0" />
                    )}
                    <p
                      className={`text-[13px] leading-tight truncate transition-colors
                        ${
                          !item.is_read
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-600"
                        }
                      `}
                    >
                      {item.title}
                    </p>
                  </div>

                  {/* Message */}
                  <p className="text-[13px] text-gray-500 line-clamp-2 leading-snug mb-1.5">
                    {item.message}
                  </p>

                  {/* Relative Timestamp */}
                  <p className="text-[11px] text-gray-400 font-medium">
                    {formatTimeAgo(item.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (!userId) return null;

  return (
    // 4. Bind the open state to the Dropdown
    <Dropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      popupRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Badge count={unreadCount}>
        <Avatar
          icon={<BellOutlined />}
          shape="circle"
          size="small"
          className="bg-slate-700! text-slate-200! ring-2 ring-white/10"
        />
      </Badge>
    </Dropdown>
  );
}
