"use client";

import { Button, Tag } from "antd";
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
    const loadCategories = async () => {
      const data = await fetchCategoriesWithSubcategories();
      setCategories(data);
    };
    loadCategories();
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
    asap: { label: "Urgent", color: "red", icon: "🔥" },
    "this-week": { label: "This Week", color: "orange", icon: "📅" },
    "this-month": { label: "This Month", color: "blue", icon: "🗓️" },
    planning: { label: "Flexible", color: "default", icon: "✨" },
  }[job.urgency] || { label: "Flexible", color: "default", icon: "✨" };

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-5">
      <div className="space-y-4">
        {/* Top Row: Back + Status */}
        <div className="flex items-center justify-between">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            {showBalance && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                <WalletOutlined className="text-gray-500 text-xs" />
                <span className="text-xs font-medium text-gray-700">
                  {creditBalance} credits
                </span>
              </div>
            )}
            {job.is_expired && (
              <Tag color="default" className="font-medium rounded-full">
                Expired
              </Tag>
            )}
          </div>
        </div>

        {/* Category + Urgency */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {categoryConfig?.label}
          </span>
          <Tag
            color={urgencyConfig.color}
            className="py-1 px-3 text-xs font-medium rounded-full flex items-center gap-1 border-0"
          >
            <span>{urgencyConfig.icon}</span>
            {urgencyConfig.label}
          </Tag>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">
          {job.title}
        </h2>

        {/* Meta Row */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <WalletOutlined className="text-gray-400" />
            <strong className="text-gray-900 font-semibold">
              {budgetLabel}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <EnvironmentOutlined className="text-gray-400" />
            {job.state_code}
          </span>
          {job.preferred_date && (
            <span className="flex items-center gap-1.5">
              <CalendarOutlined className="text-gray-400" />
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
