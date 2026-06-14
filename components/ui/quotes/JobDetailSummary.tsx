"use client";

import { useState, useEffect } from "react";
import { Spin } from "antd";
import {
  EnvironmentOutlined,
  WalletOutlined,
  CalendarOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";
import { JobListing } from "@/lib/jobs/types";

interface Props {
  job: JobListing;
}

export default function JobDetailSummary({ job }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setCategories(await fetchCategoriesWithSubcategories());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryConfig = categories.find((c) => c.value === job.category);
  const subcategoryConfig = categoryConfig?.subcategories.find(
    (s) => s.value === job.subcategory
  );

  const budgetLabel =
    {
      "under-10k": "Under ₦10k",
      "10k-50k": "₦10k – ₦50k",
      "50k-100k": "₦50k – ₦100k",
      "100k-500k": "₦100k – ₦500k",
      "500k+": "₦500k+",
      flexible: "Flexible",
    }[job.budget] || job.budget;

  if (loading) {
    return (
      <div className="lg:col-span-1">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 sticky top-24">
          <div className="flex justify-center py-12">
            <Spin />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 sticky top-24 space-y-6">
        <div>
          <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4">
            Job Summary
          </h3>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-none">
              <AppstoreOutlined className="text-primary text-[18px]" />
            </div>
            <div>
              <p className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                Category
              </p>
              <p className="font-inter text-[16px] font-medium text-on-surface">
                {categoryConfig?.label || job.category}
              </p>
            </div>
          </div>
          <h2 className="font-manrope text-[20px] font-semibold text-primary leading-tight">
            {subcategoryConfig?.label || job.subcategory}
          </h2>
        </div>

        <div className="h-px bg-outline-variant/30" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none">
              <WalletOutlined className="text-primary text-[14px]" />
            </div>
            <div>
              <p className="font-inter text-[12px] text-on-surface-variant">
                Budget
              </p>
              <p className="font-inter text-[14px] font-semibold text-on-surface">
                {budgetLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none">
              <EnvironmentOutlined className="text-primary text-[14px]" />
            </div>
            <div>
              <p className="font-inter text-[12px] text-on-surface-variant">
                Location
              </p>
              <p className="font-inter text-[14px] font-semibold text-on-surface">
                {job.state_code || job.lga_name || "Remote"}
              </p>
            </div>
          </div>
          {job.preferred_date && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none">
                <CalendarOutlined className="text-primary text-[14px]" />
              </div>
              <div>
                <p className="font-inter text-[12px] text-on-surface-variant">
                  Preferred Date
                </p>
                <p className="font-inter text-[14px] font-semibold text-on-surface">
                  {new Date(job.preferred_date).toLocaleDateString("en-NG")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-outline-variant/30" />

        <div>
          <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Description
          </h4>
          <p className="font-inter text-[14px] text-on-surface-variant leading-relaxed line-clamp-6">
            {job.description}
          </p>
        </div>
      </div>
    </div>
  );
}
