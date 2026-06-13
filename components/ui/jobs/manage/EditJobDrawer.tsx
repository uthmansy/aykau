"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Divider,
  App,
  Checkbox,
  Spin,
} from "antd";
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
const { Text } = Typography;

// ─────────────────────────────────────────────────────────────
// DYNAMIC FIELDS (Still hardcoded - these are form-specific)
// ─────────────────────────────────────────────────────────────

const DYNAMIC_FIELDS: Record<
  string,
  {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "select";
    options?: { value: string; label: string }[];
    placeholder?: string;
  }[]
> = {
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

  // 🟢 Fetch categories from database
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesWithSubcategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
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
        ...(job.custom_details || {}), // Spread dynamic fields
      });
    }
  }, [open, job, form]);

  // 🟢 Get subcategories for selected category from database
  const getSubcategoryOptions = () => {
    if (!selectedCategory) return [];
    const category = categories.find((c) => c.value === selectedCategory);
    return (
      category?.subcategories.map((s) => ({
        value: s.value,
        label: s.label,
      })) || []
    );
  };

  const dynamicFields = useMemo(() => {
    if (!selectedSubcategory) return [];
    return DYNAMIC_FIELDS[selectedSubcategory] || [];
  }, [selectedSubcategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory(null);
    form.setFieldsValue({ subcategory: undefined });
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
  };

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

    // Extract dynamic fields into custom_details JSON
    const customDetails = Object.fromEntries(
      Object.entries(values).filter(([key]) => !knownFields.includes(key))
    );

    const payload = {
      title: values.title,
      category: values.category,
      subcategory: values.subcategory,
      description: values.description,
      service_type: values.service_type,
      address: values.address,
      budget: values.budget,
      urgency: values.urgency,
      frequency: values.frequency,
      preferred_date: values.preferred_date,
      contact_methods: values.contact_methods,
      access_notes: values.access_notes,
      custom_details: customDetails,
    };

    const { data, error } = await supabase
      .from("job_requests")
      .update(payload)
      .eq("id", job.id)
      .select()
      .single();

    if (error) {
      message.error("Failed to update job. Please try again.");
    } else {
      message.success("Job updated successfully!");
      onUpdated(data);
      onClose();
    }
  };

  if (loadingCategories) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        size={520}
        closable={false}
        styles={{
          body: { padding: "24px" },
        }}
      >
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FileTextOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900 leading-tight">
              Edit Job Details
            </div>
            <Text type="secondary" className="text-xs font-normal">
              Update your job post information
            </Text>
          </div>
        </div>
      }
      size={520}
      onClose={onClose}
      open={open}
      closable={false}
      styles={{
        body: { padding: "24px", paddingBottom: "24px", background: "#fafafa" },
        header: { borderBottom: "1px solid #f3f4f6", padding: "16px 24px" },
      }}
      extra={
        <Button
          type="text"
          icon={<CloseOutlined className="text-gray-400" />}
          onClick={onClose}
          className="w-8! h-8! flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-gray-600"
        />
      }
      footer={
        <div className="flex justify-end gap-3 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <Button
            onClick={onClose}
            className="rounded-lg px-5 h-10 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            icon={<CheckOutlined />}
            className="rounded-lg px-6 h-10 font-medium bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-sm"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          requiredMark={false}
          className="space-y-1"
        >
          {/* SECTION: Basic Info */}
          <div>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Basic Information
            </Text>
            <Form.Item
              name="title"
              label={
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <TagOutlined className="text-gray-400" /> Job Title
                </span>
              }
              rules={[{ required: true, message: "Please enter a title" }]}
              className="mb-4!"
            >
              <Input
                placeholder="e.g. Interior Designer Needed..."
                className="rounded-lg! h-10! hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="category"
                label={
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <InfoCircleOutlined className="text-gray-400" /> Category
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
                  onChange={handleCategoryChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:border-gray-200!"
                />
              </Form.Item>

              <Form.Item
                name="subcategory"
                label={
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <InfoCircleOutlined className="text-gray-400" /> Subcategory
                  </span>
                }
                rules={[{ required: true, message: "Select subcategory" }]}
                className="mb-0!"
              >
                <Select
                  placeholder="Select"
                  options={getSubcategoryOptions()}
                  disabled={!selectedCategory}
                  onChange={handleSubcategoryChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:border-gray-200!"
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="my-6! border-gray-100!" />

          {/* SECTION: Description */}
          <div>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Job Description
            </Text>
            <Form.Item
              name="description"
              label={
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <FileTextOutlined className="text-gray-400" /> Details
                </span>
              }
              rules={[
                { required: true, message: "Please enter a description" },
                {
                  min: 20,
                  message: "Description must be at least 20 characters",
                },
              ]}
              className="mb-0!"
            >
              <TextArea
                rows={5}
                placeholder="Describe the job requirements in detail..."
                showCount
                maxLength={2000}
                className="rounded-lg! resize-none! hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>
          </div>

          <Divider className="my-6! border-gray-100!" />

          {/* SECTION: Location */}
          <div>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Location & Service Type
            </Text>
            <Form.Item
              name="service_type"
              label={
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <EnvironmentOutlined className="text-gray-400" /> Service
                  Location Type
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
                className="w-full [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:border-gray-200!"
              />
            </Form.Item>

            <Form.Item
              name="address"
              label={
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <EnvironmentOutlined className="text-gray-400" /> Address /
                  Landmark
                </span>
              }
              className="mb-0!"
            >
              <Input
                placeholder="e.g. Near Shoprite, Victoria Island"
                className="rounded-lg! h-10! hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>
          </div>

          <Divider className="my-6! border-gray-100!" />

          {/* SECTION: Budget & Time */}
          <div>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Budget & Timeline
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="budget"
                label={
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <WalletOutlined className="text-gray-400" /> Budget
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
                  className="w-full [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:border-gray-200!"
                />
              </Form.Item>

              <Form.Item
                name="urgency"
                label={
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <ThunderboltOutlined className="text-gray-400" /> Urgency
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
                  className="w-full [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:border-gray-200!"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Form.Item
                name="frequency"
                label={
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <CalendarOutlined className="text-gray-400" /> Frequency
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
                  className="w-full [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:border-gray-200!"
                />
              </Form.Item>

              <Form.Item
                name="preferred_date"
                label={
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <CalendarOutlined className="text-gray-400" /> Preferred
                    Date
                  </span>
                }
                className="mb-0!"
              >
                <Input
                  type="date"
                  className="rounded-lg! h-10! hover:border-blue-300 focus:border-blue-500"
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="my-6! border-gray-100!" />

          {/* SECTION: Contact & Access */}
          <div>
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Contact & Access
            </Text>
            <Form.Item
              name="contact_methods"
              label={
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <ContactsOutlined className="text-gray-400" /> Preferred
                  Contact Methods
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
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <KeyOutlined className="text-gray-400" /> Access &
                  Instructions
                </span>
              }
              className="mb-0!"
            >
              <TextArea
                rows={3}
                placeholder="e.g. Parking is available at the back, ring the bell twice..."
                className="rounded-lg! resize-none! hover:border-blue-300 focus:border-blue-500"
              />
            </Form.Item>
          </div>

          {/* SECTION: Dynamic Fields */}
          {dynamicFields.length > 0 && (
            <>
              <Divider className="my-6! border-gray-100!" />
              <div>
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  Additional Details
                </Text>
                {dynamicFields.map((field) => (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={
                      <span className="text-sm font-semibold text-gray-800">
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
                        className="w-full [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:border-gray-200!"
                      />
                    ) : field.type === "number" ? (
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        className="rounded-lg! h-10! hover:border-blue-300 focus:border-blue-500"
                      />
                    ) : field.type === "date" ? (
                      <Input
                        type="date"
                        className="rounded-lg! h-10! hover:border-blue-300 focus:border-blue-500"
                      />
                    ) : (
                      <Input
                        placeholder={field.placeholder}
                        className="rounded-lg! h-10! hover:border-blue-300 focus:border-blue-500"
                      />
                    )}
                  </Form.Item>
                ))}
              </div>
            </>
          )}
        </Form>
      </div>
    </Drawer>
  );
}
