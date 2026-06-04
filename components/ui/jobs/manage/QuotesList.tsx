// components/jobs/manage/QuotesList.tsx
"use client";

import { useState } from "react";
import { Avatar, Typography, Badge, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import QuoteDetailModal from "./QuoteDetailModal";

const { Text, Title } = Typography;

interface Props {
  quotes: any[];
  jobId: string;
  onQuoteAction: () => void;
}

export default function QuotesList({ quotes, jobId, onQuoteAction }: Props) {
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "blue";
      case "responded":
        return "orange";
      case "accepted":
        return "green";
      case "declined":
        return "red";
      default:
        return "default";
    }
  };

  const openModal = (quote: any) => {
    setSelectedQuote(quote);
    setIsModalOpen(true);

    // Mark as viewed when opened
    // supabase.from('job_quotes').update({ is_viewed: true }).eq('id', quote.id)
  };

  return (
    <>
      {/* Sticky Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-160px)] sticky top-6 overflow-hidden">
        {/* Inbox Header */}
        <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
          <div>
            <Title level={5} className="mb-0! text-gray-900">
              Quotes
            </Title>
            <Text type="secondary" className="text-xs">
              {quotes.length} received
            </Text>
          </div>
          {/* Future: Add a filter/sort dropdown here */}
        </div>

        {/* Scrollable List Area */}
        <div className="flex-1 overflow-y-auto">
          {quotes.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6">
              <Empty
                description="No quotes received yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {quotes.map((quote) => {
                const isUnread = !quote.is_viewed;

                return (
                  <div
                    key={quote.id}
                    onClick={() => openModal(quote)}
                    className={`flex gap-3 p-4 cursor-pointer transition-all group
                      ${
                        isUnread
                          ? "bg-blue-50/40 hover:bg-blue-50/70"
                          : "hover:bg-gray-50"
                      }`}
                  >
                    {/* Avatar with Unread Dot */}
                    <Badge dot={isUnread} offset={[-4, 42]} color="#3b82f6">
                      <Avatar
                        src={quote.artisan?.avatar_url}
                        icon={<UserOutlined />}
                        size={48}
                        className="border-2 border-white shadow-sm shrink-0"
                      />
                    </Badge>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top Row: Name & Time */}
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`truncate block max-w-32.5 ${
                            isUnread
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {quote.artisan?.full_name ||
                            quote.artisan?.username ||
                            "Artisan"}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(quote.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Middle Row: Price & Status */}
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-bold text-gray-500">
                          {quote.quoted_price
                            ? `₦${Number(quote.quoted_price).toLocaleString()}`
                            : "Negotiable"}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide
                            ${
                              quote.status === "pending"
                                ? "bg-blue-50 text-blue-600"
                                : quote.status === "responded"
                                ? "bg-orange-50 text-orange-600"
                                : quote.status === "accepted"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                        >
                          {quote.status}
                        </span>
                      </div>

                      {/* Bottom Row: Message Snippet */}
                      <p
                        className={`text-xs line-clamp-1 m-0 ${
                          isUnread
                            ? "text-gray-700 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {quote.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedQuote && (
        <QuoteDetailModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedQuote(null);
          }}
          quote={selectedQuote}
          onActionComplete={onQuoteAction}
        />
      )}
    </>
  );
}
