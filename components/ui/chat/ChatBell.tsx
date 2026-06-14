"use client";

import { Badge, Avatar } from "antd";
import Link from "next/link";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import { useAuthStore } from "@/store/auth.store";
import { MessageOutlined } from "@ant-design/icons";

export default function ChatBell() {
  const userId = useAuthStore((state) => state.user?.id);
  const { unreadMessageCount } = useChatNotifications();

  if (!userId) return null;

  return (
    <Link href="/dashboard/messages" style={{ display: "block" }}>
      <Badge
        count={unreadMessageCount}
        size="small"
        style={{ boxShadow: "none" }}
        // Override badge background to primary navy
        classNames={{ root: "chat-badge" }}
      >
        <Avatar
          icon={<MessageOutlined />}
          shape="circle"
          size={32}
          style={{
            backgroundColor: "#f0ecf4",
            color: "#464651",
            transition: "opacity 0.2s",
          }}
        />
      </Badge>
      <style jsx global>{`
        .chat-badge .ant-badge-count {
          background-color: #15196c;
          box-shadow: none;
          font-family: "Inter", sans-serif;
          font-weight: 600;
        }
      `}</style>
    </Link>
  );
}
