// components/profile/RequestQuoteModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Select, Button, App } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";

const { TextArea } = Input;

// 🟢 UPDATED: Added onSuccess to the Props interface
interface Props {
  open: boolean;
  onClose: () => void;
  artisanId: string;
  artisanName: string;
  preferredSubcategories?: string[];
  onSuccess?: (conversationId: string, jobId: string) => void; // 🟢 NEW PROP
}

const BUDGET_RANGES = [
  { value: "under-10k", label: "Under ₦10,000" },
  { value: "10k-50k", label: "₦10,000 - ₦50,000" },
  { value: "50k-100k", label: "₦50,000 - ₦100,000" },
  { value: "100k-500k", label: "₦100,000 - ₦500,000" },
  { value: "500k+", label: "₦500,000+" },
  { value: "flexible", label: "Flexible / Get Quotes" },
];

const URGENCY_OPTIONS = [
  { value: "asap", label: "🔥 As soon as possible" },
  { value: "this-week", label: "📅 Within this week" },
  { value: "this-month", label: "🗓️ Within this month" },
  { value: "planning", label: "🕐 Just planning / Flexible" },
];

const SERVICE_TYPE_OPTIONS = [
  { value: "home", label: "🏠 At my home" },
  { value: "business", label: "🏢 At my business" },
  { value: "remote", label: "💻 Remote / Online" },
  { value: "other", label: "📍 Other location" },
];

// 🟢 UPDATED: Destructured onSuccess from props
export default function RequestQuoteModal({
  open,
  onClose,
  artisanId,
  artisanName,
  preferredSubcategories = [],
  onSuccess, // 🟢 NEW
}: Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    serviceType: "home",
    budget: "",
    urgency: "this-week",
  });

  useEffect(() => {
    if (open) {
      fetchCategoriesWithSubcategories().then(setCategories);
    }
  }, [open]);

  useEffect(() => {
    if (
      categories.length > 0 &&
      preferredSubcategories.length > 0 &&
      !form.category
    ) {
      const firstPreferred = preferredSubcategories[0];
      const matchingCategory = categories.find((c) =>
        c.subcategories?.some((s) => s.value === firstPreferred)
      );
      if (matchingCategory) {
        setForm((prev) => ({
          ...prev,
          category: matchingCategory.value,
          subcategory: firstPreferred,
        }));
      }
    }
  }, [categories, preferredSubcategories, form.category]);

  const categoryOptions = categories.map((c) => ({
    value: c.value,
    label: `${c.icon || ""} ${c.label}`,
  }));

  const getSubcategoryOptions = (categoryValue: string) =>
    categories
      .find((c) => c.value === categoryValue)
      ?.subcategories?.map((s) => ({ value: s.value, label: s.label })) || [];

  const handleCategoryChange = (value: string) => {
    setForm({ ...form, category: value, subcategory: "" });
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) {
      return message.warning("Title must be at least 3 characters.");
    }
    if (!form.description.trim() || form.description.length < 20) {
      return message.warning("Description must be at least 20 characters.");
    }
    if (!form.category) {
      return message.warning("Please select a service category.");
    }
    if (!form.subcategory) {
      return message.warning("Please select a specific service.");
    }
    if (!form.budget) {
      return message.warning("Please select a budget range.");
    }
    if (!form.serviceType) {
      return message.warning("Please select a service location type.");
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("request_quote_from_profile", {
        p_artisan_id: artisanId,
        p_title: form.title,
        p_description: form.description,
        p_category: form.category,
        p_subcategory: form.subcategory,
        p_service_type: form.serviceType,
        p_budget: form.budget,
        p_urgency: form.urgency,
      });

      if (error) throw error;

      message.success(`Quote request sent to ${artisanName}!`);

      // 🟢 NEW: Trigger the onSuccess callback with the returned IDs
      if (onSuccess) {
        onSuccess(data.conversation_id, data.job_id);
      }

      onClose();
      setForm({
        title: "",
        description: "",
        category: "",
        subcategory: "",
        serviceType: "home",
        budget: "",
        urgency: "this-week",
      });

      router.push(`/dashboard/messages?c=${data.conversation_id}`);
    } catch (error: any) {
      console.error("Request quote error:", error);
      message.error(error.message || "Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      serviceType: "home",
      budget: "",
      urgency: "this-week",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={640}
      centered
      styles={{
        body: { padding: 0, borderRadius: "16px", overflow: "hidden" },
      }}
    >
      <div className="bg-surface-container-lowest p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <ThunderboltOutlined className="text-secondary text-xl" />
          </div>
          <div>
            <h3 className="font-manrope text-lg font-semibold text-primary mb-0">
              Request a Quote
            </h3>
            <p className="text-on-surface-variant font-inter text-sm">
              Tell {artisanName.split(" ")[0]} what you need
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-inter font-medium text-on-surface mb-1.5">
              What do you need help with? *
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Install kitchen cabinets"
              className="rounded-lg! h-11! font-inter!"
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Min 3 characters
            </p>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-inter font-medium text-on-surface mb-1.5">
                Category *
              </label>
              <Select
                value={form.category || undefined}
                onChange={handleCategoryChange}
                options={categoryOptions}
                placeholder="Select category"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="w-full! rounded-lg!"
                size="large"
              />
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-on-surface mb-1.5">
                Specific Service *
              </label>
              <Select
                value={form.subcategory || undefined}
                onChange={(val) => setForm({ ...form, subcategory: val })}
                options={getSubcategoryOptions(form.category)}
                disabled={!form.category}
                placeholder="Select service"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="w-full! rounded-lg!"
                size="large"
              />
            </div>
          </div>

          {/* Service Type & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-inter font-medium text-on-surface mb-1.5">
                Service Location *
              </label>
              <Select
                value={form.serviceType}
                onChange={(val) => setForm({ ...form, serviceType: val })}
                options={SERVICE_TYPE_OPTIONS}
                className="w-full! rounded-lg!"
                size="large"
              />
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-on-surface mb-1.5">
                Budget Range *
              </label>
              <Select
                value={form.budget || undefined}
                onChange={(val) => setForm({ ...form, budget: val })}
                options={BUDGET_RANGES}
                placeholder="Select budget"
                className="w-full! rounded-lg!"
                size="large"
              />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-inter font-medium text-on-surface mb-1.5">
              How urgent is this? *
            </label>
            <Select
              value={form.urgency}
              onChange={(val) => setForm({ ...form, urgency: val })}
              options={URGENCY_OPTIONS}
              className="w-full! rounded-lg!"
              size="large"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-inter font-medium text-on-surface mb-1.5">
              Describe the job in detail *
            </label>
            <TextArea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Include details like specific requirements, timeline, access instructions, etc..."
              className="rounded-lg! resize-none! font-inter!"
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Min 20 characters ({form.description.length}/20)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
            <p className="text-xs text-on-surface-variant font-inter leading-relaxed">
              💡 <strong className="text-primary">How it works:</strong> Once
              you submit, a conversation will open where{" "}
              {artisanName.split(" ")[0]} can ask questions and send you a
              detailed quote.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-outline-variant/20 mt-4">
          <Button
            onClick={handleClose}
            block
            className="rounded-lg! h-11! font-inter! border-outline! text-on-surface! hover:border-primary! hover:text-primary!"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            block
            className="rounded-lg! h-11! bg-secondary! border-secondary! font-inter! font-semibold! hover:bg-secondary/90! shadow-[var(--shadow-level-1)]!"
          >
            Send Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}
