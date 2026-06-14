"use client";

import { Button } from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  WalletOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import { useEffect, useState } from "react";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";

interface Props {
  job: JobListing;
  onClose: () => void;
  creditBalance: number;
  showBalance: boolean;
}

export default function DrawerHeader({
  job,
  onClose,
  creditBalance,
  showBalance,
}: Props) {
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
    <div className="sticky top-0 z-10 bg-surface-glass backdrop-blur-glass border-b border-outline-variant/30 px-6 py-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onClose}
            className="text-on-surface-variant! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium! p-0!"
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            {showBalance && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                <WalletOutlined className="text-primary text-[12px]" />
                <span className="font-inter text-[12px] font-semibold text-primary">
                  {creditBalance} credits
                </span>
              </div>
            )}
            {job.is_expired && (
              <span className="px-2.5 py-0.5 rounded-full bg-on-surface-variant/10 text-on-surface-variant font-inter text-[10px] font-bold uppercase tracking-wider">
                Expired
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-primary/5 text-primary border border-primary/10">
            {categoryConfig?.label}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 ${urgencyConfig.bg} ${urgencyConfig.text}`}
          >
            <span>
              {urgencyConfig.label === "Urgent"
                ? "🔥"
                : urgencyConfig.label === "Flexible"
                  ? "✨"
                  : "📅"}
            </span>
            {urgencyConfig.label}
          </span>
        </div>

        <h2 className="font-manrope text-[24px] font-semibold text-primary leading-tight tracking-tight">
          {job.title}
        </h2>

        <div className="flex flex-wrap gap-4 font-inter text-[14px] text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <WalletOutlined className="text-outline" />
            <strong className="text-on-surface font-semibold">
              {budgetLabel}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <EnvironmentOutlined className="text-outline" />
            {job.state_code}
          </span>
          {job.preferred_date && (
            <span className="flex items-center gap-1.5">
              <CalendarOutlined className="text-outline" />
              {new Date(job.preferred_date).toLocaleDateString("en-NG", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
