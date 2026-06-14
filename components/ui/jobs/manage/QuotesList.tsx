"use client";

import { useState } from "react";
import { Avatar, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import QuoteDetailModal from "./QuoteDetailModal";

// 1. Define proper types to replace 'any'
interface Artisan {
  avatar_url?: string;
  full_name?: string;
  username?: string;
}

interface Quote {
  id: string | number;
  status: "pending" | "responded" | "accepted" | "declined" | string;
  is_viewed?: boolean;
  created_at: string;
  quoted_price?: number | string;
  message?: string;
  artisan?: Artisan;
}

interface Props {
  quotes: Quote[];
  jobId: string;
  onQuoteAction: () => void;
}

export default function QuotesList({ quotes, jobId, onQuoteAction }: Props) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsModalOpen(true);
  };

  // Helper to get styles safely
  const getStatusStyles = (status: string) => {
    const styles = {
      pending: { bg: "bg-primary/10", text: "text-primary" },
      responded: { bg: "bg-warning/10", text: "text-warning" },
      accepted: {
        bg: "bg-success-emerald/10",
        text: "text-success-emerald",
      },
      declined: { bg: "bg-error/10", text: "text-error" },
    };

    // Use type assertion or check if key exists
    return (
      styles[status as keyof typeof styles] || {
        bg: "bg-on-surface-variant/10",
        text: "text-on-surface-variant",
      }
    );
  };

  return (
    <>
      {/* Sticky Container */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 flex flex-col h-[calc(100vh-160px)] sticky top-24 overflow-hidden">
        {/* Inbox Header */}
        <div className="p-5 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
          <h3 className="font-manrope text-[20px] font-semibold text-primary">
            Quotes
          </h3>
          <p className="font-inter text-[14px] text-on-surface-variant">
            {quotes.length} received
          </p>
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
            <div>
              {quotes.map((quote) => {
                const isUnread = !quote.is_viewed;
                // 2. Use the helper function to avoid indexing errors
                const statusStyles = getStatusStyles(quote.status);

                return (
                  <div
                    key={quote.id}
                    onClick={() => openModal(quote)}
                    className={`flex gap-4 p-5 cursor-pointer transition-all border-b border-outline-variant/10 last:border-b-0
                                        ${isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-surface-container"}`}
                  >
                    <Avatar
                      src={quote.artisan?.avatar_url}
                      icon={<UserOutlined />}
                      size={48}
                      className="ring-2 ring-outline-variant/20 shrink-0 bg-surface-container-lowest!"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`truncate block max-w-[150px] font-inter text-[14px] ${isUnread ? "font-semibold text-on-surface" : "font-medium text-on-surface-variant"}`}
                        >
                          {quote.artisan?.full_name ||
                            quote.artisan?.username ||
                            "Artisan"}
                        </span>
                        <span className="font-inter text-[12px] text-outline whitespace-nowrap ml-2">
                          {new Date(quote.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-manrope text-[16px] font-semibold text-on-surface">
                          {quote.quoted_price
                            ? `₦${Number(quote.quoted_price).toLocaleString()}`
                            : "Negotiable"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles.bg} ${statusStyles.text}`}
                        >
                          {quote.status}
                        </span>
                      </div>
                      <p
                        className={`font-inter text-[14px] line-clamp-1 m-0 ${isUnread ? "text-on-surface-variant font-medium" : "text-outline"}`}
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
