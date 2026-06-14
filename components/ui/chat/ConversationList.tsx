"use client";

import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface Props {
  conversations: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  currentUserId: string;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      <div className="p-5 border-b border-outline-variant/30 shrink-0">
        <h2 className="font-manrope text-[20px] font-semibold text-primary tracking-tight">
          Messages
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant font-inter text-[14px]">
            No conversations yet. <br /> Start by accepting a quote or sending
            one!
          </div>
        ) : (
          <div>
            {conversations.map((convo) => {
              const otherPerson =
                convo.customer_id === currentUserId
                  ? convo.artisan
                  : convo.customer;
              const isSelected = convo.id === selectedId;
              const lastMsg = convo.last_message;
              const isMyLastMsg = lastMsg?.sender_id === currentUserId;
              const lastSeen = otherPerson?.last_seen
                ? new Date(otherPerson.last_seen).getTime()
                : 0;
              const isOnline =
                lastSeen > 0 && Date.now() - lastSeen < 5 * 60 * 1000;
              const unreadCount = convo.unread_count || 0;

              return (
                <div
                  key={convo.id}
                  onClick={() => onSelect(convo.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-outline-variant/10
                    ${isSelected ? "bg-primary/5" : "hover:bg-surface-container"}`}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      src={otherPerson?.avatar_url}
                      icon={<UserOutlined />}
                      size={48}
                      className="bg-surface-container text-on-surface-variant ring-2 ring-outline-variant/20"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-surface-container-lowest transition-colors ${isOnline ? "bg-success-emerald" : "bg-outline-variant"}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span
                        className={`font-inter text-[14px] truncate block max-w-[150px] transition-colors ${unreadCount > 0 ? "font-semibold text-on-surface" : "font-medium text-on-surface-variant"}`}
                      >
                        {otherPerson?.full_name ||
                          otherPerson?.username ||
                          "User"}
                      </span>
                      {lastMsg && (
                        <span
                          className={`font-inter text-[11px] shrink-0 ml-2 transition-colors ${unreadCount > 0 ? "text-on-surface-variant font-medium" : "text-outline"}`}
                        >
                          {new Date(lastMsg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <span className="font-inter text-[12px] text-on-surface-variant block truncate mb-0.5 font-medium">
                      {convo.job?.title || "Job Discussion"}
                    </span>

                    <div className="flex justify-between items-center">
                      <span
                        className={`font-inter text-[12px] block truncate transition-colors ${unreadCount > 0 ? "text-on-surface-variant font-medium" : "text-outline"}`}
                      >
                        {lastMsg
                          ? (isMyLastMsg ? "You: " : "") +
                            (lastMsg.content || "📎 Sent an attachment")
                          : "No messages yet"}
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-secondary text-on-secondary text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shrink-0 ml-2">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
