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
  StarFilled,
} from "@ant-design/icons";
import Link from "next/link";
import { JobListing } from "@/lib/jobs/types";
import { SERVICE_CATEGORIES, SERVICE_SUBCATEGORIES } from "../JobPostingForm";
import { useState } from "react";
import JobDetailDrawer from "./JobDetailDrawer";

interface Props {
  job: JobListing;
  showActions?: boolean;
  variant?: "default" | "compact";
}

export default function JobCard({
  job,
  showActions = false,
  variant = "default",
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
    asap: { label: "Urgent", color: "red" },
    "this-week": { label: "This Week", color: "orange" },
    "this-month": { label: "This Month", color: "blue" },
    planning: { label: "Flexible", color: "default" },
  }[job.urgency] || { label: "Flexible", color: "default" };

  const isCompact = variant === "compact";

  // ───────── Poster Info Helpers ─────────
  const poster = job.poster;
  const posterName = poster?.full_name || poster?.username || "Anonymous";
  const posterAvatar = poster?.avatar_url;
  const isVerified = poster?.is_verified;
  // const memberSince = poster?.created_at;
  // const posterRating = poster?.rating;
  // const posterReviews = poster?.reviews;

  return (
    <>
      {/* <Link href={`/jobs/${job.id}`} className="block h-full group" prefetch> */}
      <div
        onClick={() => setDrawerOpen(true)}
        className="block h-full group cursor-pointer"
      >
        <article
          className={`
          relative bg-white rounded-xl border border-gray-200 
          hover:border-blue-300 hover:shadow-lg
          transition-all duration-200 ease-out
          flex flex-col h-full
          ${job.is_expired ? "opacity-70 bg-gray-50" : ""}
          ${isCompact ? "p-3 gap-2" : "p-4 gap-3"}
        `}
        >
          {/* ───────── Header: Category + Urgency ───────── */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {categoryConfig?.label}
            </span>
            {job.urgency !== "planning" && (
              <Tag
                color={urgencyConfig.color}
                className="m-0 py-0.5 px-2.5 text-xs font-medium rounded-full"
              >
                {urgencyConfig.label}
              </Tag>
            )}
          </div>

          {/* ───────── Job Title ───────── */}
          <h3
            className={`font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors ${
              isCompact ? "text-sm line-clamp-2" : "text-base line-clamp-2"
            }`}
          >
            {subcategoryConfig?.label || job.subcategory}
          </h3>

          {/* ───────── Description ───────── */}
          <p
            className={`text-gray-500 leading-relaxed ${
              isCompact ? "text-xs line-clamp-2" : "text-sm line-clamp-3"
            }`}
          >
            {job.description_preview}
          </p>

          {/* ───────── Meta Grid ───────── */}
          <div
            className={`grid ${
              isCompact ? "grid-cols-2" : "grid-cols-3"
            } gap-y-2 gap-x-3 pt-2 border-t border-gray-100`}
          >
            <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
              <WalletOutlined className="text-gray-400 shrink-0" />
              <span className="font-medium text-gray-700 truncate">
                {budgetLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
              <EnvironmentOutlined className="text-gray-400 shrink-0" />
              <span className="truncate">{job.state}</span>
            </div>
            {job.created_at && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <ClockCircleOutlined className="text-gray-400 shrink-0" />
                <span>{timeAgo(job.created_at)}</span>
              </div>
            )}
          </div>
          {/* ───────── Poster Info (Bark.com Style) ───────── */}
          <div className="flex items-center gap-3 pt-3 mt-auto">
            {/* Avatar with Verification Badge */}
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
                  size={36}
                  src={posterAvatar}
                  className="bg-linear-to-br from-blue-50 to-indigo-50 text-blue-600 border-2 border-white shadow-sm ring-1 ring-gray-100"
                  icon={<UserOutlined />}
                />
              </Badge>
            </Tooltip>

            {/* Name + Trust Signals */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 truncate max-w-35">
                  {posterName}
                </span>
                {/* {posterRating && (
                <span className="inline-flex items-center gap-0.5 text-xs text-amber-500">
                  <StarFilled className="text-[10px]" />
                  {posterRating}
                  {posterReviews !== undefined && (
                    <span className="text-gray-400">({posterReviews})</span>
                  )}
                </span>
              )} */}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {/* {memberSince && (
                <span>
                  Member since{" "}
                  {new Date(memberSince).toLocaleDateString("en-NG", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )} */}
                {/* {poster?.location && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="truncate">{poster.location}</span>
                </>
              )} */}
              </div>
            </div>

            {/* Quote Count */}
            {job.quote_count && job.quote_count > 0 && (
              <Tooltip
                title={`${job.quote_count} quote${
                  job.quote_count > 1 ? "s" : ""
                } received`}
              >
                <div className="flex flex-col items-center justify-center min-w-11 px-2 py-1.5 bg-blue-50 rounded-lg">
                  <MessageOutlined className="text-blue-500 text-sm" />
                  <span className="text-xs font-bold text-blue-700 leading-none mt-0.5">
                    {job.quote_count}
                  </span>
                </div>
              </Tooltip>
            )}
          </div>

          {/* ───────── Action Button ───────── */}
          {showActions && (
            <div
              className={`pt-3 border-t border-gray-100 ${
                isCompact ? "mt-2" : ""
              }`}
            >
              <Button
                type="text"
                className={`p-0 h-auto font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1.5 group/btn transition-colors ${
                  isCompact ? "text-xs" : "text-sm"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  // Handle quote action
                }}
              >
                Send Quote
                <ArrowRightOutlined className="transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          )}

          {/* ───────── Expired Badge ───────── */}
          {job.is_expired && (
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                Expired
              </span>
            </div>
          )}
        </article>
      </div>
      {/* </Link> */}
      {/* The Slide-Over Drawer */}
      <JobDetailDrawer
        job={job}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onQuoteClick={(jobId) => {
          // Handle quote navigation or modal
          window.location.href = `/jobs/${jobId}/quote`;
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper: Human-readable time (Nigerian locale)
// ─────────────────────────────────────────────────────────────
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
