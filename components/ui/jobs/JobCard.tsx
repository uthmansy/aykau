"use client";

import { Button } from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  WalletOutlined,
  MessageOutlined,
  LockOutlined,
  UnlockOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import { useEffect, useState } from "react";
import JobDetailDrawer from "./JobDetailDrawer";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";

interface Props {
  job: JobListing;
  isUnlocked?: boolean;
  creditCost?: number;
  isArtisanViewer?: boolean;
}

export default function JobCard({
  job,
  isUnlocked = false,
  creditCost = 10,
  isArtisanViewer = false,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoryConfig = categories.find((c) => c.value === job.category);

  useEffect(() => {
    fetchCategoriesWithSubcategories().then(setCategories);
  }, []);

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
    asap: {
      label: "Urgent",
      bg: "bg-secondary-container/20",
      text: "text-secondary",
    },
    "this-week": {
      label: "This Week",
      bg: "bg-primary/5",
      text: "text-primary",
    },
    "this-month": {
      label: "This Month",
      bg: "bg-primary/5",
      text: "text-primary",
    },
    planning: {
      label: "Flexible",
      bg: "bg-tertiary-container/10",
      text: "text-tertiary",
    },
  }[job.urgency] || {
    label: "Flexible",
    bg: "bg-tertiary-container/10",
    text: "text-tertiary",
  };

  return (
    <>
      <div
        onClick={() => setDrawerOpen(true)}
        // ✅ Changed to rounded-lg (8px) per DESIGN.md for standard cards
        className="bg-surface-container-lowest rounded-lg p-6 shadow-[var(--shadow-level-1)] border border-outline-variant/20 group hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Left Side: Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`${urgencyConfig.bg} ${urgencyConfig.text} px-3 py-1 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider`}
              >
                {urgencyConfig.label}
              </span>
              <span className="text-on-surface-variant font-inter text-[12px] font-semibold uppercase tracking-wider">
                Posted {timeAgo(job.created_at || "")}
              </span>
            </div>

            {/* ✅ Reduced title size from 24px to 20px for better visual balance */}
            <h2 className="font-manrope text-[20px] font-semibold text-primary group-hover:text-secondary transition-colors leading-tight">
              {job.title}
            </h2>

            <p className="font-inter text-[15px] text-on-surface-variant line-clamp-2 max-w-2xl leading-relaxed">
              {job.description_preview}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {job.state && (
                <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg text-on-surface-variant">
                  <EnvironmentOutlined className="text-[16px]" />
                  <span className="font-inter text-[13px] font-medium">
                    {job.state}
                  </span>
                </div>
              )}
              {categoryConfig && (
                <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg text-on-surface-variant">
                  <AppstoreOutlined className="text-[16px]" />
                  <span className="font-inter text-[13px] font-medium">
                    {categoryConfig.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Budget & Actions */}
          <div className="md:w-64 flex flex-col justify-between items-end border-l border-outline-variant/20 pl-0 md:pl-6">
            <div className="text-right space-y-1 w-full">
              <div className="font-manrope text-[20px] font-semibold text-primary">
                {budgetLabel}
              </div>
              <div className="font-inter text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
                Project Budget
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full mt-6">
              <div className="flex justify-between items-center px-1">
                {isArtisanViewer ? (
                  isUnlocked ? (
                    <span className="font-inter text-[12px] font-semibold text-success-emerald flex items-center gap-1">
                      <UnlockOutlined className="text-[14px]" /> Unlocked
                    </span>
                  ) : (
                    <span className="font-inter text-[12px] font-semibold text-on-surface-variant flex items-center gap-1">
                      <LockOutlined className="text-[14px]" /> {creditCost}{" "}
                      Credits
                    </span>
                  )
                ) : (
                  <span className="font-inter text-[12px] text-on-surface-variant">
                    {creditCost} Credits
                  </span>
                )}

                <span
                  className={`font-inter text-[12px] flex items-center gap-1 ${job.quote_count && job.quote_count > 0 ? "text-secondary font-semibold" : "text-on-surface-variant"}`}
                >
                  <MessageOutlined className="text-[14px]" />{" "}
                  {job.quote_count || 0} Quotes
                </span>
              </div>

              <Button
                type="primary"
                block
                size="large"
                // ✅ Changed to rounded-lg (8px) per DESIGN.md for standard buttons
                className="rounded-lg! h-auto! py-3! font-inter! text-[14px]! font-medium!"
              >
                {isArtisanViewer && !isUnlocked
                  ? "Unlock & Quote"
                  : "Quote Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <JobDetailDrawer
        job={job}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onQuoteClick={(id) => {
          window.location.href = `/jobs/${id}/quote`;
        }}
      />
    </>
  );
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
