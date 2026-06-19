"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Dropdown, App, Avatar } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuthStore } from "@/store/auth.store";

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
  const [isOpen, setIsOpen] = useState(false);
  const lastToastedIdRef = useRef<string | null>(null);

  // Toast on new notification
  useEffect(() => {
    if (userId && unreadCount > prevCountRef.current && unreadCount > 0) {
      const latest = notifications[0];
      // Only toast if this is a new notification we haven't already toasted
      if (latest && latest.id !== lastToastedIdRef.current) {
        const positiveTypes = [
          "funds_released",
          "wallet_credited",
          "job_completed",
          "escrow_funded",
          "success",
          "quote_accepted",
          "payment_approved",
        ];
        const warningTypes = [
          "payment_rejected",
          "quote_declined",
          "warning",
          "job_expired",
        ];

        const notifyMethod = positiveTypes.includes(latest.type)
          ? notification.success
          : warningTypes.includes(latest.type)
            ? notification.warning
            : notification.info;

        notifyMethod({
          message: latest.title,
          description: latest.message,
          placement: "topRight",
          duration: 5,
        });
        // Mark this notification as toasted
        lastToastedIdRef.current = latest.id;
      }
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, notifications, notification, userId]);

  const handleItemClick = (item: any) => {
    if (!item.is_read) markAsRead(item.id);
    if (item.link) {
      setIsOpen(false);
      router.push(item.link);
    }
  };

  // Dropdown content – fully converted to Tailwind
  const dropdownContent = (
    <div className="w-80 max-w-[calc(100vw-32px)] bg-surface-container-lowest rounded-lg shadow-[var(--shadow-level-2)] border border-outline-variant overflow-hidden font-inter">
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-4 border-b border-outline-variant bg-surface-container-lowest">
        <span className="text-sm font-semibold text-foreground">
          Notifications
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-medium text-outline bg-transparent border-none cursor-pointer flex items-center gap-1 py-1 px-2 rounded-[6px] transition-all hover:bg-surface-container hover:text-primary"
          >
            <CheckOutlined className="text-[10px]" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[448px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mb-3">
              <BellOutlined className="text-xl text-outline-variant" />
            </div>
            <p className="text-sm font-medium text-foreground m-0">
              All caught up!
            </p>
            <p className="text-xs text-outline mt-1">No new notifications</p>
          </div>
        ) : (
          <div className="border-t border-surface-container">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-surface-container ${
                  item.is_read
                    ? "bg-surface-container-lowest hover:bg-surface-container-high"
                    : "bg-surface-container-low hover:bg-surface-container-high"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <p
                      className={`text-[0.8125rem] leading-[1.4] m-0 ${
                        !item.is_read
                          ? "font-semibold text-foreground"
                          : "font-medium text-on-surface-variant"
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>
                  <p className="text-xs text-outline mb-1.5 leading-[1.4] line-clamp-2">
                    {item.message}
                  </p>
                  <p className="text-[0.6875rem] text-outline-variant m-0">
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
    <Dropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      // ✅ 1. Changed from popupRender to dropdownRender
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
      // ✅ 2. Strip AntD's default wrapper background, shadow, and padding
      // so your inner div's bg-surface-container-lowest and shadow take over completely.
      overlayClassName="bg-transparent! shadow-none! p-0!"
    >
      <Badge
        count={unreadCount}
        size="small"
        styles={{
          root: { boxShadow: "none" },
          indicator: {
            backgroundColor: "var(--secondary)",
            boxShadow: "none",
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 600,
          },
        }}
      >
        <Avatar
          icon={<BellOutlined />}
          shape="circle"
          size={32}
          className="bg-surface-container! text-on-surface-variant! transition-opacity"
        />
      </Badge>
    </Dropdown>
  );
}
