// components/ui/jobs/JobCard.tsx
"use client";

import { Tag, Avatar, Button, Badge, Tooltip } from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
  UserOutlined,
  WalletOutlined,
  MessageOutlined,
  CheckCircleFilled,
  LockOutlined,
  UnlockOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import { SERVICE_CATEGORIES, SERVICE_SUBCATEGORIES } from "../JobPostingForm";
import { useState } from "react";
import JobDetailDrawer from "./JobDetailDrawer";

interface Props {
  job: JobListing;
  showActions?: boolean;
  variant?: "default" | "compact";
  isUnlocked?: boolean;
  creditCost?: number;
  isArtisanViewer?: boolean;
}

export default function JobCard({
  job,
  showActions = false,
  variant = "default",
  isUnlocked = false,
  creditCost = 10,
  isArtisanViewer = false,
}: Props) {
  const categoryConfig = SERVICE_CATEGORIES.find(
    (c) => c.value === job.category
  );
  const subcategoryConfig = SERVICE_SUBCATEGORIES[job.category]?.find(
    (s) => s.value === job.subcategory
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const budgetLabel =
    {
      "under-10k": "Under ₦10k",
      "10k-50k": "₦10k – ₦50k",
      "50k-100k": "₦50k – ₦100k",
      "100k-500k": "₦100k – ₦500k",
      "500k+": "₦500k+",
      flexible: "Flexible",
    }[job.budget] || job.budget;

  const urgencyConfig = {
    asap: { label: "Urgent", color: "red", icon: "🔥" },
    "this-week": { label: "This Week", color: "orange", icon: "📅" },
    "this-month": { label: "This Month", color: "blue", icon: "🗓️" },
    planning: { label: "Flexible", color: "default", icon: "✨" },
  }[job.urgency] || { label: "Flexible", color: "default", icon: "✨" };

  const isCompact = variant === "compact";

  const poster = job.poster;
  const posterName = poster?.full_name || poster?.username || "Anonymous";
  const posterAvatar = poster?.avatar_url;
  const isVerified = poster?.is_verified;

  // 🟢 Credit cost color coding
  const getCreditColor = (cost: number) => {
    if (cost <= 5)
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    if (cost <= 15)
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    if (cost <= 25)
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      };
    return {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    };
  };

  const creditColor = getCreditColor(creditCost);

  return (
    <>
      <div
        onClick={() => setDrawerOpen(true)}
        className="block h-full group cursor-pointer"
      >
        <article
          className={`
            relative bg-white rounded-2xl border border-gray-200 
            hover:border-gray-300 hover:shadow-xl
            transition-all duration-300 ease-out
            flex flex-col h-full overflow-hidden
            ${job.is_expired ? "opacity-60 bg-gray-50" : ""}
            ${isCompact ? "p-4 gap-3" : "p-5 gap-4"}
          `}
        >
          {/* ───────── Credit Badge (Below Header) ───────── */}
          {isArtisanViewer && !job.is_expired && (
            <div className="flex justify-end">
              {isUnlocked ? (
                <Tooltip title="You've unlocked this job">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                    <UnlockOutlined className="text-green-600 text-xs" />
                    <span className="text-xs font-semibold text-green-700">
                      Unlocked
                    </span>
                  </div>
                </Tooltip>
              ) : (
                <Tooltip title="Unlock to view contact & send quote">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 ${creditColor.bg} ${creditColor.border} border rounded-full`}
                  >
                    <LockOutlined className={`${creditColor.text} text-xs`} />
                    <span
                      className={`text-xs font-semibold ${creditColor.text}`}
                    >
                      {creditCost} credits
                    </span>
                  </div>
                </Tooltip>
              )}
            </div>
          )}

          {/* ───────── Header: Category + Urgency ───────── */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              {categoryConfig?.label}
            </span>
            {job.urgency !== "planning" && (
              <Tag
                color={urgencyConfig.color}
                className="m-0 py-1 px-3 text-xs font-medium rounded-full border-0 flex items-center gap-1"
              >
                <span>{urgencyConfig.icon}</span>
                {urgencyConfig.label}
              </Tag>
            )}
          </div>

          {/* ───────── Job Title ───────── */}
          <h3
            className={`font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors ${
              isCompact ? "text-base line-clamp-2" : "text-lg line-clamp-2"
            }`}
          >
            {subcategoryConfig?.label || job.title}
          </h3>

          {/* ───────── Description ───────── */}
          <p
            className={`text-gray-600 leading-relaxed ${
              isCompact ? "text-sm line-clamp-2" : "text-sm line-clamp-3"
            }`}
          >
            {job.description_preview}
          </p>

          {/* ───────── Meta Grid ───────── */}
          <div
            className={`grid ${
              isCompact ? "grid-cols-2" : "grid-cols-3"
            } gap-y-2.5 gap-x-3 pt-3 border-t border-gray-100`}
          >
            <div className="flex items-center gap-2 text-xs text-gray-600 min-w-0">
              <WalletOutlined className="text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-800 truncate">
                {budgetLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 min-w-0">
              <EnvironmentOutlined className="text-gray-400 shrink-0" />
              <span className="truncate">{job.state}</span>
            </div>
            {job.created_at && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ClockCircleOutlined className="text-gray-400 shrink-0" />
                <span>{timeAgo(job.created_at)}</span>
              </div>
            )}
          </div>

          {/* ───────── Poster Info ───────── */}
          <div className="flex items-center gap-3 pt-3 mt-auto">
            <Tooltip title={isVerified ? "Verified member" : undefined}>
              <Badge
                count={
                  isVerified ? (
                    <CheckCircleFilled
                      style={{
                        color: "#10b981",
                        fontSize: 14,
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                      }}
                    />
                  ) : undefined
                }
                offset={[-6, 10]}
                size="small"
              >
                <Avatar
                  size={40}
                  src={posterAvatar}
                  className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border-2 border-white shadow-sm ring-1 ring-gray-100"
                  icon={<UserOutlined />}
                />
              </Badge>
            </Tooltip>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                  {posterName}
                </span>
              </div>
            </div>

            {job.quote_count && job.quote_count > 0 && (
              <Tooltip
                title={`${job.quote_count} quote${
                  job.quote_count > 1 ? "s" : ""
                } received`}
              >
                <div className="flex flex-col items-center justify-center min-w-[44px] px-2.5 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <MessageOutlined className="text-blue-500 text-sm" />
                  <span className="text-xs font-bold text-blue-700 leading-none mt-0.5">
                    {job.quote_count}
                  </span>
                </div>
              </Tooltip>
            )}
          </div>

          {/* ───────── Expired Badge ───────── */}
          {job.is_expired && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                Expired
              </span>
            </div>
          )}
        </article>
      </div>

      <JobDetailDrawer
        job={job}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onQuoteClick={(jobId) => {
          window.location.href = `/jobs/${jobId}/quote`;
        }}
      />
    </>
  );
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}
