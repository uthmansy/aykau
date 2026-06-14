"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Select, Tag, Space, Button } from "antd";
import {
  CloseOutlined,
  FilterOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { NIGERIAN_STATES } from "@/constants/constants";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";
import type { JobFilters } from "@/lib/jobs/types";

interface Props {
  initialFilters?: Partial<JobFilters>;
  mobile?: boolean;
  onClose?: () => void;
}

export default function JobFilters({
  initialFilters = {},
  mobile = false,
  onClose,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Partial<JobFilters>>({
    ...initialFilters,
  });
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

  const urgencyOptions = [
    { value: "asap", label: "Immediate" },
    { value: "this-week", label: "Within a week" },
    { value: "this-month", label: "This month" },
    { value: "planning", label: "Planning ahead" },
  ];

  const getSubcategories = () =>
    categories.find((c) => c.value === filters.category)?.subcategories || [];
  const getCategoryLabel = (v: string) =>
    categories.find((c) => c.value === v)?.label || v;
  const getSubcategoryLabel = (v: string) =>
    getSubcategories().find((s) => s.value === v)?.label || v;
  const getUrgencyLabel = (v: string) =>
    urgencyOptions.find((o) => o.value === v)?.label || v;

  const syncFilters = (newFilters: Partial<JobFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...filters, ...newFilters };

    const currentSearch = searchParams.get("search");
    if (currentSearch) params.set("search", currentSearch);

    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value as string);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`/jobs?${params.toString()}`);
  };

  const updateFilter = (key: keyof JobFilters, value: any) => {
    const updates = { [key]: value };
    if (key === "category") updates.subcategory = undefined;
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    syncFilters(newFilters);
  };

  const clearAll = () => {
    setFilters({});
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("subcategory");
    params.delete("location");
    params.delete("urgency");
    params.delete("budget");
    params.set("page", "1");
    router.push(`/jobs?${params.toString()}`);
  };

  const hasActiveFilters = () =>
    filters.category ||
    filters.subcategory ||
    filters.location ||
    filters.urgency;

  if (loading)
    return (
      <div className="p-8 text-center text-on-surface-variant">
        Loading filters...
      </div>
    );

  return (
    // ✅ Dynamic container: Sidebar gets card styling + sticky; Mobile gets full-height flex layout
    <div
      className={
        mobile
          ? "w-full h-full flex flex-col bg-surface-container-lowest"
          : "bg-surface-container-lowest rounded-lg shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden w-full sticky top-24"
      }
    >
      {/* Header */}
      <div
        className={`px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center ${mobile ? "" : "bg-primary/5"}`}
      >
        <h3 className="font-inter text-[16px] font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <FilterOutlined /> Filters
        </h3>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-2 -mr-2"
          >
            <CloseOutlined className="text-[18px]" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div
        className={`p-6 space-y-6 ${mobile ? "flex-1 overflow-y-auto" : ""}`}
      >
        {/* Category */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <AppstoreOutlined className="text-[20px]" />
            <h4 className="font-inter text-[14px] font-bold uppercase tracking-wider">
              Category
            </h4>
          </div>
          <Select
            placeholder="All Categories"
            value={filters.category}
            onChange={(v) => updateFilter("category", v)}
            options={categories.map((c) => ({
              value: c.value,
              label: `${c.icon || ""} ${c.label}`,
            }))}
            allowClear
            showSearch
            className="w-full"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Subcategories */}
        {getSubcategories().length > 0 && (
          <div className="space-y-3">
            <h4 className="font-inter text-[14px] font-bold uppercase tracking-wider text-primary">
              Services
            </h4>
            <Space wrap size={[8, 8]}>
              {getSubcategories().map((sub) => (
                <Tag.CheckableTag
                  key={sub.value}
                  checked={filters.subcategory === sub.value}
                  onChange={(c) =>
                    updateFilter("subcategory", c ? sub.value : undefined)
                  }
                  className="rounded-full! px-3! py-1! border! border-outline-variant! bg-surface-container! text-on-surface-variant!"
                >
                  {sub.label}
                </Tag.CheckableTag>
              ))}
            </Space>
          </div>
        )}

        {/* Location */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <EnvironmentOutlined className="text-[20px]" />
            <h4 className="font-inter text-[14px] font-bold uppercase tracking-wider">
              Location
            </h4>
          </div>
          <Select
            placeholder="Anywhere"
            value={filters.location}
            onChange={(v) => updateFilter("location", v)}
            options={NIGERIAN_STATES.map((s) => ({ value: s, label: s }))}
            allowClear
            showSearch
            className="w-full"
          />
        </div>

        {/* Urgency */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ClockCircleOutlined className="text-[20px]" />
            <h4 className="font-inter text-[14px] font-bold uppercase tracking-wider">
              Urgency
            </h4>
          </div>
          <div className="flex flex-col gap-2">
            {urgencyOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.urgency === opt.value}
                  onChange={(e) =>
                    updateFilter(
                      "urgency",
                      e.target.checked ? opt.value : undefined
                    )
                  }
                  className="rounded border-outline-variant text-secondary focus:ring-secondary/20 w-4 h-4"
                />
                <span className="font-inter text-[14px] text-on-surface-variant group-hover:text-primary transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {!mobile && hasActiveFilters() && (
          <button
            onClick={clearAll}
            className="w-full py-3 text-[14px] text-on-surface-variant hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all border border-transparent hover:border-secondary/20 font-medium"
          >
            Clear Applied Filters
          </button>
        )}
      </div>

      {/* ✅ Mobile Sticky Footer */}
      {mobile && (
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest flex gap-3">
          {hasActiveFilters() && (
            <Button
              onClick={clearAll}
              className="rounded-lg! h-auto! py-3! flex-1! border-outline-variant! text-on-surface-variant!"
            >
              Clear
            </Button>
          )}
          <Button
            type="primary"
            block
            onClick={onClose}
            className="rounded-lg! h-auto! py-3! font-inter! text-[14px]! font-medium!"
          >
            Show Results
          </Button>
        </div>
      )}
    </div>
  );
}
