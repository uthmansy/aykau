"use client";

import { Badge, Avatar } from "antd";
import Link from "next/link";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import { useAuthStore } from "@/store/auth.store";
import { MessageOutlined } from "@ant-design/icons";

export default function ChatBell() {
  const userId = useAuthStore((state) => state.user?.id);
  const { unreadMessageCount } = useChatNotifications();

  // Don't render if no user is logged in
  if (!userId) return null;

  return (
    // Link to your future /dashboard/messages page
    <Link href="/dashboard/messages" className="block">
      <Badge count={unreadMessageCount} size="small">
        <Avatar
          icon={<MessageOutlined />}
          shape="circle"
          size="small"
          className="bg-slate-700! text-slate-200! ring-2 ring-white/10"
        />
      </Badge>
    </Link>
  );
}
