"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Input, Select, Tag, Space, Button, Divider, Spin } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

import { NIGERIAN_STATES } from "@/constants/constants";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";

import type { JobFilters } from "@/lib/jobs/types";

interface Props {
  initialFilters?: Partial<JobFilters>;
}

export default function JobFilters({ initialFilters = {} }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Partial<JobFilters>>({
    ...initialFilters,
    search: initialFilters.search ?? "",
  });

  // 🟢 Fetch categories from database
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesWithSubcategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const urgencyOptions = [
    { value: "asap", label: "ASAP" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "planning", label: "Flexible" },
  ];

  // 🟢 Get subcategories for the selected category
  const getSubcategories = () => {
    if (!filters.category) return [];
    const category = categories.find((c) => c.value === filters.category);
    return category?.subcategories || [];
  };

  // 🟢 Get category label from database
  const getCategoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value;
  };

  // 🟢 Get subcategory label from database
  const getSubcategoryLabel = (value: string) => {
    const subs = getSubcategories();
    return subs.find((opt) => opt.value === value)?.label || value;
  };

  const getUrgencyLabel = (value: string) => {
    return urgencyOptions.find((opt) => opt.value === value)?.label || value;
  };

  const syncFilters = (newFilters: Partial<JobFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...filters, ...newFilters };

    if (merged.search?.trim()) {
      params.set("search", merged.search.trim());
    } else {
      params.delete("search");
    }

    Object.entries(merged).forEach(([key, value]) => {
      if (key !== "search" && value) {
        params.set(key, value as string);
      } else if (key !== "search") {
        params.delete(key);
      }
    });

    params.set("page", "1");
    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const updateFilter = (key: keyof JobFilters, value: any) => {
    const updates = { [key]: value };
    if (key === "category") {
      updates.subcategory = undefined;
    }
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    syncFilters(newFilters);
  };

  const clearAll = () => {
    const emptyFilters = { search: "" };
    setFilters(emptyFilters);
    syncFilters(emptyFilters);
  };

  const removeFilter = (key: keyof JobFilters) => {
    const updates: Partial<JobFilters> = {
      [key]: undefined,
    };

    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    syncFilters(newFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search?.trim() ||
      filters.category ||
      filters.subcategory ||
      filters.location ||
      filters.urgency
    );
  };

  const activeFiltersList = () => {
    const active = [];
    if (filters.search?.trim()) {
      active.push({ key: "search", label: `Search: ${filters.search}` });
    }
    if (filters.category) {
      active.push({
        key: "category",
        label: getCategoryLabel(filters.category),
      });
    }
    if (filters.subcategory) {
      active.push({
        key: "subcategory",
        label: getSubcategoryLabel(filters.subcategory),
      });
    }
    if (filters.location) {
      active.push({ key: "location", label: filters.location });
    }
    if (filters.urgency) {
      active.push({ key: "urgency", label: getUrgencyLabel(filters.urgency) });
    }
    return active;
  };

  if (loading) {
    return (
      <Card
        variant="borderless"
        className="w-full max-w-[320px]"
        styles={{ body: { padding: "20px" } }}
      >
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="borderless"
      className="w-full max-w-[320px]"
      styles={{ body: { padding: "20px" } }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <Space align="center">
          <FilterOutlined className="text-gray-400" />
          <span className="font-medium text-gray-800">Filters</span>
        </Space>
        {hasActiveFilters() && (
          <Button type="link" size="small" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-5">
        <Input
          placeholder="Search jobs"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onPressEnter={() => syncFilters(filters)}
          allowClear
          size="middle"
        />
      </div>

      {/* Active filter tags */}
      {hasActiveFilters() && (
        <div className="mb-5">
          <Space wrap size={[8, 8]}>
            {activeFiltersList().map((filter) => (
              <Tag
                key={filter.key}
                closable
                onClose={() => removeFilter(filter.key as keyof JobFilters)}
                className="flex items-center gap-1"
              >
                {filter.label}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      <Divider className="my-4!" />

      {/* Category */}
      <div className="mb-4">
        <div className="mb-2 text-sm text-gray-600">Category</div>
        <Select
          placeholder="Select category"
          value={filters.category}
          onChange={(value) => updateFilter("category", value)}
          options={categories.map((c) => ({
            value: c.value,
            label: `${c.icon || ""} ${c.label}`,
          }))}
          allowClear
          showSearch
          size="middle"
          className="w-full"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>

      {/* Subcategories */}
      {getSubcategories().length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-sm text-gray-600">Services</div>
          <Space wrap size={[8, 8]}>
            {getSubcategories().map((sub) => (
              <Tag.CheckableTag
                key={sub.value}
                checked={filters.subcategory === sub.value}
                onChange={(checked) =>
                  updateFilter("subcategory", checked ? sub.value : undefined)
                }
              >
                {sub.label}
              </Tag.CheckableTag>
            ))}
          </Space>
        </div>
      )}

      {/* Location */}
      <div className="mb-4">
        <div className="mb-2 text-sm text-gray-600">Location</div>
        <Select
          placeholder="Anywhere"
          value={filters.location}
          onChange={(value) => updateFilter("location", value)}
          options={NIGERIAN_STATES.map((state) => ({
            value: state,
            label: state,
          }))}
          allowClear
          showSearch
          size="middle"
          className="w-full"
        />
      </div>

      {/* Urgency */}
      <div className="mb-4">
        <div className="mb-2 text-sm text-gray-600">Urgency</div>
        <Space wrap size={[8, 8]}>
          {urgencyOptions.map((option) => (
            <Tag.CheckableTag
              key={option.value}
              checked={filters.urgency === option.value}
              onChange={(checked) =>
                updateFilter("urgency", checked ? option.value : undefined)
              }
            >
              {option.label}
            </Tag.CheckableTag>
          ))}
        </Space>
      </div>
    </Card>
  );
}
