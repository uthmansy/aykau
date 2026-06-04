// components/messages/ConversationList.tsx
"use client";

import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
          Messages
        </h2>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No conversations yet. <br /> Start by accepting a quote or sending
            one!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {conversations.map((convo) => {
              const otherPerson =
                convo.customer_id === currentUserId
                  ? convo.artisan
                  : convo.customer;

              const isSelected = convo.id === selectedId;
              const lastMsg = convo.last_message;
              const isMyLastMsg = lastMsg?.sender_id === currentUserId;

              // Online Status Logic (Active in last 5 minutes)
              const lastSeen = otherPerson?.last_seen
                ? new Date(otherPerson.last_seen).getTime()
                : 0;
              const isOnline =
                lastSeen > 0 && Date.now() - lastSeen < 5 * 60 * 1000;

              // Unread Count
              const unreadCount = convo.unread_count || 0;

              return (
                <div
                  key={convo.id}
                  onClick={() => onSelect(convo.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors
                    ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"}
                  `}
                >
                  {/* Avatar with Online/Offline Dot */}
                  <div className="relative shrink-0">
                    <Avatar
                      src={otherPerson?.avatar_url}
                      icon={<UserOutlined />}
                      size={48}
                      className="bg-gray-200 text-gray-600"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white transition-colors
                        ${isOnline ? "bg-green-500" : "bg-gray-300"}
                      `}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {/* Top Row: Name & Time */}
                    <div className="flex justify-between items-baseline mb-0.5">
                      <Text
                        strong={unreadCount > 0}
                        className={`text-sm truncate block max-w-[150px] transition-colors ${
                          unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {otherPerson?.full_name ||
                          otherPerson?.username ||
                          "User"}
                      </Text>
                      {lastMsg && (
                        <Text
                          className={`text-[11px] shrink-0 ml-2 transition-colors ${
                            unreadCount > 0
                              ? "text-gray-600 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {new Date(lastMsg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      )}
                    </div>

                    {/* Middle Row: Job Title */}
                    <Text className="text-xs text-gray-500 block truncate mb-0.5 font-medium">
                      {convo.job?.title || "Job Discussion"}
                    </Text>

                    {/* Bottom Row: Last Message Preview & Unread Badge */}
                    <div className="flex justify-between items-center">
                      <Text
                        className={`text-xs block truncate transition-colors ${
                          unreadCount > 0
                            ? "text-gray-700 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {lastMsg
                          ? (isMyLastMsg ? "You: " : "") +
                            (lastMsg.content || "📎 Sent an attachment")
                          : "No messages yet"}
                      </Text>

                      {/* Numeric Unread Badge */}
                      {unreadCount > 0 && (
                        <span className="bg-gray-900 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0 ml-2">
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
