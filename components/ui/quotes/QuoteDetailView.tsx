"use client";

import { getStatusConfig } from "@/lib/helpers/quotes";
import { Button } from "antd";
import {
  EditOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Dispatch, SetStateAction } from "react";

// Define valid status types
type QuoteStatus = "pending" | "accepted" | "declined" | string;

interface Props {
  myQuote: any;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}

export default function QuoteDetailView({ myQuote, setIsEditing }: Props) {
  const statusConfig = getStatusConfig(myQuote.status);
  const canEdit = myQuote.status === "pending";

  // Define the type for status styles
  type StatusStyle = {
    bg: string;
    text: string;
    icon: React.ReactNode;
  };

  const statusStyles: Record<string, StatusStyle> = {
    pending: {
      bg: "bg-primary/10",
      text: "text-primary",
      icon: <ClockCircleOutlined />,
    },
    accepted: {
      bg: "bg-success-emerald/10",
      text: "text-success-emerald",
      icon: <CheckCircleOutlined />,
    },
    declined: {
      bg: "bg-error/10",
      text: "text-error",
      icon: <CloseCircleOutlined />,
    },
  };

  // Safely access the style, providing a default fallback
  const currentStatusStyle = statusStyles[myQuote.status] || {
    bg: "bg-on-surface-variant/10",
    text: "text-on-surface-variant",
    icon: <ClockCircleOutlined />,
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-manrope text-[24px] font-semibold text-primary mb-2">
            Your Submitted Quote
          </h3>
          <p className="font-inter text-[14px] text-on-surface-variant">
            Submitted{" "}
            {new Date(myQuote.created_at).toLocaleDateString("en-NG", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full font-inter text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${currentStatusStyle.bg} ${currentStatusStyle.text}`}
        >
          {currentStatusStyle.icon} {statusConfig.label}
        </span>
      </div>

      <div className="space-y-8">
        {/* Message */}
        <div>
          <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Cover Letter / Message
          </h4>
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
            <p className="font-inter text-[16px] text-on-surface-variant whitespace-pre-wrap leading-relaxed">
              {myQuote.message}
            </p>
          </div>
        </div>

        {/* Price & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
            <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
              Quoted Price
            </h4>
            <p className="font-manrope text-[24px] font-semibold text-primary mb-2">
              {myQuote.quoted_price
                ? `₦ ${Number(myQuote.quoted_price).toLocaleString()}`
                : "Not specified"}
            </p>
            {myQuote.quoted_price_note && (
              <p className="font-inter text-[14px] text-on-surface-variant leading-relaxed">
                {myQuote.quoted_price_note}
              </p>
            )}
          </div>
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
            <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
              Availability
            </h4>
            <p className="font-inter text-[16px] font-medium text-on-surface">
              {myQuote.availability_note || "Not specified"}
            </p>
          </div>
        </div>

        {/* Portfolio */}
        {myQuote.portfolio_links?.length > 0 && (
          <div>
            <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
              Portfolio Links
            </h4>
            <div className="space-y-2">
              {myQuote.portfolio_links.map((link: string, idx: number) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-inter text-[14px] text-primary hover:text-secondary break-all bg-surface-container px-4 py-3 rounded-lg border border-outline-variant/20 hover:border-primary/40 transition-colors"
                >
                  <LinkOutlined className="text-[16px]" /> {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-outline-variant/30" />

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="font-inter text-[14px] text-on-surface-variant">
          {canEdit
            ? "You can still edit this quote while it's pending review."
            : "This quote has been processed and can no longer be edited."}
        </p>
        {canEdit && (
          <Button
            onClick={() => setIsEditing(true)}
            icon={<EditOutlined />}
            className="rounded-lg! h-auto! py-3! px-6! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
          >
            Edit Quote
          </Button>
        )}
      </div>
    </div>
  );
}
