"use client";

import { useEffect, useState, useMemo } from "react";
import { Drawer, Form, Input, Button, Select, App, Checkbox } from "antd";
import {
  FileTextOutlined,
  WalletOutlined,
  ThunderboltOutlined,
  KeyOutlined,
  CloseOutlined,
  CheckOutlined,
  TagOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ContactsOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";

const { TextArea } = Input;

const DYNAMIC_FIELDS: Record<string, any[]> = {
  cleaning: [
    {
      name: "numRooms",
      label: "Number of rooms",
      type: "number",
      placeholder: "e.g. 3",
    },
    {
      name: "propertyType",
      label: "Property type",
      type: "select",
      options: [
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "House" },
        { value: "office", label: "Office" },
      ],
    },
  ],
  plumbing: [
    {
      name: "issueType",
      label: "Type of issue",
      type: "select",
      options: [
        { value: "leak", label: "Leak / Dripping" },
        { value: "clog", label: "Clog / Blockage" },
        { value: "install", label: "Installation" },
        { value: "repair", label: "General Repair" },
      ],
    },
    {
      name: "location",
      label: "Location of issue",
      type: "text",
      placeholder: "e.g. Kitchen sink",
    },
  ],
  photography: [
    {
      name: "eventType",
      label: "Event type",
      type: "select",
      options: [
        { value: "wedding", label: "Wedding" },
        { value: "birthday", label: "Birthday" },
        { value: "corporate", label: "Corporate" },
        { value: "portrait", label: "Portrait / Headshots" },
      ],
    },
    {
      name: "numHours",
      label: "Estimated hours needed",
      type: "number",
      placeholder: "e.g. 4",
    },
    { name: "eventDate", label: "Event date", type: "date" },
  ],
  "web-dev": [
    {
      name: "projectType",
      label: "Project type",
      type: "select",
      options: [
        { value: "website", label: "New Website" },
        { value: "ecommerce", label: "E-commerce Store" },
        { value: "webapp", label: "Web Application" },
        { value: "redesign", label: "Redesign / Update" },
      ],
    },
    {
      name: "features",
      label: "Key features needed",
      type: "text",
      placeholder: "e.g. User login, Payment",
    },
  ],
};

interface Props {
  open: boolean;
  onClose: () => void;
  job: any;
  onUpdated: (updatedJob: any) => void;
}

export default function EditJobDrawer({
  open,
  onClose,
  job,
  onUpdated,
}: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setCategories(await fetchCategoriesWithSubcategories());
      } finally {
        setLoadingCategories(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (open && job) {
      setSelectedCategory(job.category || null);
      setSelectedSubcategory(job.subcategory || null);
      form.setFieldsValue({
        title: job.title,
        category: job.category,
        subcategory: job.subcategory,
        description: job.description,
        service_type: job.service_type,
        address: job.address,
        budget: job.budget,
        urgency: job.urgency,
        frequency: job.frequency,
        preferred_date: job.preferred_date,
        contact_methods: job.contact_methods || [],
        access_notes: job.access_notes,
        ...(job.custom_details || {}),
      });
    }
  }, [open, job, form]);

  const getSubcategoryOptions = () => {
    if (!selectedCategory) return [];
    return (
      categories
        .find((c) => c.value === selectedCategory)
        ?.subcategories.map((s) => ({ value: s.value, label: s.label })) || []
    );
  };

  const dynamicFields = useMemo(
    () =>
      selectedSubcategory ? DYNAMIC_FIELDS[selectedSubcategory] || [] : [],
    [selectedSubcategory]
  );

  const handleSave = async (values: any) => {
    const knownFields = [
      "title",
      "category",
      "subcategory",
      "description",
      "service_type",
      "address",
      "budget",
      "urgency",
      "frequency",
      "preferred_date",
      "contact_methods",
      "access_notes",
    ];
    const customDetails = Object.fromEntries(
      Object.entries(values).filter(([key]) => !knownFields.includes(key))
    );
    const payload = { ...values, custom_details: customDetails };

    const { data, error } = await supabase
      .from("job_requests")
      .update(payload)
      .eq("id", job.id)
      .select()
      .single();
    if (error) message.error("Failed to update job.");
    else {
      message.success("Job updated successfully!");
      onUpdated(data);
      onClose();
    }
  };

  // ✅ Shared classes for inputs
  const inputClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! h-10! px-3! font-inter! text-[14px]! focus:ring-1! focus:ring-primary/30!";
  // ✅ Shared classes for selects
  const selectClasses =
    "w-full! [&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:shadow-none! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[14px]!";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      closable={false}
      styles={{
        body: { padding: 0, background: "var(--surface-container-low)" },
        header: { display: "none" },
      }}
    >
      <div className="h-full flex flex-col">
        {/* Custom Header */}
        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-lowest flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
              <FileTextOutlined className="text-primary text-[18px]" />
            </div>
            <div>
              <h3 className="font-manrope text-[20px] font-semibold text-primary leading-tight">
                Edit Job Details
              </h3>
              <p className="font-inter text-[14px] text-on-surface-variant">
                Update your job post information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
          >
            <CloseOutlined className="text-[16px]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-[var(--shadow-level-1)]">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              requiredMark={false}
              className="space-y-2"
            >
              {/* SECTION: Basic Info */}
              <div className="mb-8">
                <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 block">
                  Basic Information
                </h4>
                <Form.Item
                  name="title"
                  label={
                    <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                      Job Title
                    </span>
                  }
                  rules={[{ required: true, message: "Please enter a title" }]}
                  className="mb-4!"
                >
                  <Input
                    placeholder="e.g. Interior Designer Needed..."
                    className={inputClasses}
                  />
                </Form.Item>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="category"
                    label={
                      <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                        Category
                      </span>
                    }
                    rules={[{ required: true, message: "Select category" }]}
                    className="mb-0!"
                  >
                    <Select
                      placeholder="Select"
                      options={categories.map((c) => ({
                        value: c.value,
                        label: `${c.icon || ""} ${c.label}`,
                      }))}
                      onChange={(v) => {
                        setSelectedCategory(v);
                        setSelectedSubcategory(null);
                        form.setFieldsValue({ subcategory: undefined });
                      }}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className={selectClasses}
                    />
                  </Form.Item>
                  <Form.Item
                    name="subcategory"
                    label={
                      <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                        Subcategory
                      </span>
                    }
                    rules={[{ required: true, message: "Select subcategory" }]}
                    className="mb-0!"
                  >
                    <Select
                      placeholder="Select"
                      options={getSubcategoryOptions()}
                      disabled={!selectedCategory}
                      onChange={setSelectedSubcategory}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className={selectClasses}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="h-px bg-outline-variant/30 my-8" />

              {/* SECTION: Description */}
              <div className="mb-8">
                <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 block">
                  Job Description
                </h4>
                <Form.Item
                  name="description"
                  label={
                    <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                      Details
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter a description" },
                    { min: 20, message: "At least 20 characters" },
                  ]}
                  className="mb-0!"
                >
                  <TextArea
                    rows={5}
                    placeholder="Describe the job requirements in detail..."
                    showCount
                    maxLength={2000}
                    className="w-full! bg-surface-container! border-none! rounded-lg! py-3! px-3! font-inter! text-[14px! resize-none! focus:ring-1! focus:ring-primary/30!"
                  />
                </Form.Item>
              </div>

              <div className="h-px bg-outline-variant/30 my-8" />

              {/* SECTION: Location */}
              <div className="mb-8">
                <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 block">
                  Location & Service Type
                </h4>
                <Form.Item
                  name="service_type"
                  label={
                    <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                      Service Location Type
                    </span>
                  }
                  className="mb-4!"
                >
                  <Select
                    placeholder="Select"
                    options={[
                      { value: "home", label: "🏠 At my home" },
                      { value: "business", label: "🏢 At my business" },
                      { value: "remote", label: "💻 Remote / Online" },
                      { value: "other", label: "📍 Other location" },
                    ]}
                    className={selectClasses}
                  />
                </Form.Item>
                <Form.Item
                  name="address"
                  label={
                    <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                      Address / Landmark
                    </span>
                  }
                  className="mb-0!"
                >
                  <Input
                    placeholder="e.g. Near Shoprite, Victoria Island"
                    className={inputClasses}
                  />
                </Form.Item>
              </div>

              <div className="h-px bg-outline-variant/30 my-8" />

              {/* SECTION: Budget & Time */}
              <div className="mb-8">
                <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 block">
                  Budget & Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="budget"
                    label={
                      <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                        Budget
                      </span>
                    }
                    rules={[{ required: true, message: "Select budget" }]}
                    className="mb-0!"
                  >
                    <Select
                      placeholder="Select"
                      options={[
                        { value: "under-10k", label: "Under ₦10k" },
                        { value: "10k-50k", label: "₦10k – ₦50k" },
                        { value: "50k-100k", label: "₦50k – ₦100k" },
                        { value: "100k-500k", label: "₦100k – ₦500k" },
                        { value: "500k+", label: "₦500k+" },
                        { value: "flexible", label: "Flexible" },
                      ]}
                      className={selectClasses}
                    />
                  </Form.Item>
                  <Form.Item
                    name="urgency"
                    label={
                      <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                        Urgency
                      </span>
                    }
                    rules={[{ required: true, message: "Select urgency" }]}
                    className="mb-0!"
                  >
                    <Select
                      placeholder="Select"
                      options={[
                        { value: "asap", label: "🔥 ASAP" },
                        { value: "this-week", label: "📅 This Week" },
                        { value: "this-month", label: "🗓️ This Month" },
                        { value: "planning", label: "✨ Flexible" },
                      ]}
                      className={selectClasses}
                    />
                  </Form.Item>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Form.Item
                    name="frequency"
                    label={
                      <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                        Frequency
                      </span>
                    }
                    className="mb-0!"
                  >
                    <Select
                      placeholder="Select"
                      allowClear
                      options={[
                        { value: "once", label: "One-time" },
                        { value: "weekly", label: "Weekly" },
                        { value: "biweekly", label: "Every 2 weeks" },
                        { value: "monthly", label: "Monthly" },
                      ]}
                      className={selectClasses}
                    />
                  </Form.Item>
                  <Form.Item
                    name="preferred_date"
                    label={
                      <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                        Preferred Date
                      </span>
                    }
                    className="mb-0!"
                  >
                    <Input type="date" className={inputClasses} />
                  </Form.Item>
                </div>
              </div>

              <div className="h-px bg-outline-variant/30 my-8" />

              {/* SECTION: Contact & Access */}
              <div className="mb-8">
                <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 block">
                  Contact & Access
                </h4>
                <Form.Item
                  name="contact_methods"
                  label={
                    <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                      Preferred Contact Methods
                    </span>
                  }
                  className="mb-4!"
                >
                  <Checkbox.Group
                    options={[
                      { label: "Email", value: "email" },
                      { label: "Phone Call", value: "phone" },
                      { label: "WhatsApp", value: "whatsapp" },
                    ]}
                    className="flex flex-col gap-2"
                  />
                </Form.Item>
                <Form.Item
                  name="access_notes"
                  label={
                    <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                      Access & Instructions
                    </span>
                  }
                  className="mb-0!"
                >
                  <TextArea
                    rows={3}
                    placeholder="e.g. Parking is available at the back..."
                    className="w-full! bg-surface-container! border-none! rounded-lg! py-3! px-3! font-inter! text-[14px! resize-none! focus:ring-1! focus:ring-primary/30!"
                  />
                </Form.Item>
              </div>

              {/* SECTION: Dynamic Fields */}
              {dynamicFields.length > 0 && (
                <>
                  <div className="h-px bg-outline-variant/30 my-8" />
                  <div>
                    <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 block">
                      Additional Details
                    </h4>
                    {dynamicFields.map((field) => (
                      <Form.Item
                        key={field.name}
                        name={field.name}
                        label={
                          <span className="font-inter text-[14px] font-medium text-on-surface mb-1.5 block">
                            {field.label}
                          </span>
                        }
                        className="mb-4!"
                      >
                        {field.type === "select" ? (
                          <Select
                            placeholder={field.placeholder || "Select"}
                            options={field.options}
                            allowClear
                            className={selectClasses}
                          />
                        ) : field.type === "date" ? (
                          <Input type="date" className={inputClasses} />
                        ) : (
                          <Input
                            type={field.type}
                            placeholder={field.placeholder}
                            className={inputClasses}
                          />
                        )}
                      </Form.Item>
                    ))}
                  </div>
                </>
              )}
            </Form>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 flex justify-end gap-3 shrink-0">
          <Button
            onClick={onClose}
            className="rounded-lg! h-10! px-6! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            icon={<CheckOutlined />}
            className="rounded-lg! h-10! px-6! bg-secondary! hover:bg-secondary/90! border-none! text-on-secondary! font-inter! text-[14px]! font-medium!"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
