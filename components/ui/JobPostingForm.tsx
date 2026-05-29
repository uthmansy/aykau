"use client";

import { useState, useMemo } from "react";
import {
  Card,
  Steps,
  Form,
  Input,
  Button,
  Select,
  App,
  Upload,
  Divider,
  Tag,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Grid } from "antd";
import { NIGERIAN_STATES } from "@/constants/constants";
import { useJobPostStore } from "@/store/jobPostForm.store";

const { useBreakpoint } = Grid;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type ServiceCategory =
  | "home-services"
  | "events"
  | "wellness"
  | "tech"
  | "creative"
  | "lessons"
  | "automotive"
  | "other";

export interface JobPostData {
  category?: ServiceCategory;
  subcategory?: string;
  description?: string;
  photos?: File[];
  serviceLocation?: string;
  address?: string;
  serviceType?: "home" | "business" | "remote" | "other";
  budget?: string;
  urgency?: string;
  preferredDate?: string;
  contactMethod?: ("email" | "phone" | "whatsapp")[];
  customDetails?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "home-services", label: "🏠 Home Services" },
  { value: "events", label: "🎉 Events & Parties" },
  { value: "wellness", label: "💆 Health & Wellness" },
  { value: "tech", label: "💻 Tech & IT" },
  { value: "creative", label: "🎨 Creative & Design" },
  { value: "lessons", label: "📚 Lessons & Tutoring" },
  { value: "automotive", label: "🚗 Automotive" },
  { value: "other", label: "📦 Other" },
];

const SERVICE_SUBCATEGORIES: Record<
  ServiceCategory,
  { value: string; label: string }[]
> = {
  "home-services": [
    { value: "cleaning", label: "Cleaning" },
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "painting", label: "Painting & Decorating" },
    { value: "moving", label: "Moving & Delivery" },
    { value: "gardening", label: "Gardening" },
    { value: "appliance-repair", label: "Appliance Repair" },
  ],
  events: [
    { value: "photography", label: "Photography" },
    { value: "catering", label: "Catering" },
    { value: "music", label: "Music & Entertainment" },
    { value: "planning", label: "Event Planning" },
    { value: "decorations", label: "Decorations & Setup" },
  ],
  wellness: [
    { value: "massage", label: "Massage Therapy" },
    { value: "fitness", label: "Personal Training" },
    { value: "beauty", label: "Beauty & Hair" },
    { value: "counseling", label: "Counseling & Therapy" },
  ],
  tech: [
    { value: "web-dev", label: "Web Development" },
    { value: "repair", label: "Device Repair" },
    { value: "support", label: "IT Support" },
    { value: "app-dev", label: "Mobile App Development" },
  ],
  creative: [
    { value: "graphic-design", label: "Graphic Design" },
    { value: "video", label: "Video Editing" },
    { value: "writing", label: "Content Writing" },
    { value: "photography", label: "Photography" },
  ],
  lessons: [
    { value: "academic", label: "Academic Tutoring" },
    { value: "music-lessons", label: "Music Lessons" },
    { value: "language", label: "Language Lessons" },
    { value: "skills", label: "Skill Coaching" },
  ],
  automotive: [
    { value: "mechanic", label: "Auto Repair" },
    { value: "detailing", label: "Car Detailing" },
    { value: "towing", label: "Towing & Recovery" },
    { value: "parts", label: "Parts & Accessories" },
  ],
  other: [
    { value: "consulting", label: "Consulting" },
    { value: "delivery", label: "Delivery Services" },
    { value: "misc", label: "Miscellaneous" },
  ],
};

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

const CONTACT_METHODS = [
  { value: "email", label: "📧 Email" },
  { value: "phone", label: "📞 Phone / SMS" },
  { value: "whatsapp", label: "💬 WhatsApp" },
];

// Dynamic fields config per subcategory
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
    {
      name: "frequency",
      label: "Cleaning frequency",
      type: "select",
      options: [
        { value: "once", label: "One-time" },
        { value: "weekly", label: "Weekly" },
        { value: "biweekly", label: "Bi-weekly" },
        { value: "monthly", label: "Monthly" },
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
      placeholder: "e.g. Kitchen sink, Bathroom toilet",
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
      placeholder: "e.g. User login, Payment integration, Blog",
    },
  ],
  // Add more as needed...
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function JobPostingForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { message } = App.useApp();
  const { data, setStep, step, updateData, reset } = useJobPostStore();

  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Get dynamic fields for current subcategory
  const dynamicFields = useMemo(() => {
    if (!selectedSubcategory) return [];
    return DYNAMIC_FIELDS[selectedSubcategory] || [];
  }, [selectedSubcategory]);

  const next = async () => {
    try {
      const values = await form.validateFields();
      updateData(values);
      setStep(step + 1);
    } catch {
      message.error("Please complete required fields");
    }
  };

  const prev = () => setStep(step - 1);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const finalData: JobPostData = { ...data, ...values };

      setLoading(true);

      console.log("JOB REQUEST SUBMITTED:", finalData);

      // TODO: Supabase insert
      // const { error } = await supabase
      //   .from('job_requests')
      //   .insert({
      //     ...finalData,
      //     customer_id: authUser?.id,
      //     status: 'open',
      //     created_at: new Date(),
      //   });

      message.success("Request posted! You'll receive quotes within 24 hours.");
      setSubmitted(true);
    } catch {
      message.error("Please complete required fields");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: ServiceCategory) => {
    setSelectedCategory(value);
    setSelectedSubcategory(null);
    form.setFieldsValue({ subcategory: undefined });
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
  };

  const handlePhotoUpload = (info: any) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} uploaded`);
    }
    if (info.file.status === "error") {
      message.error(`${info.file.name} upload failed`);
    }

    // Update previews
    const newPreviews = info.fileList
      .filter((f: any) => f.originFileObj)
      .map((f: any) => URL.createObjectURL(f.originFileObj));
    setPhotoPreviews(newPreviews);

    // Store files in form data
    const files = info.fileList
      .map((f: any) => f.originFileObj)
      .filter(Boolean);
    form.setFieldsValue({ photos: files });
  };

  const removePhoto = (index: number) => {
    const newPreviews = [...photoPreviews];
    newPreviews.splice(index, 1);
    setPhotoPreviews(newPreviews);

    const currentFiles = form.getFieldValue("photos") || [];
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    form.setFieldsValue({ photos: newFiles });
  };

  // ─────────────────────────────────────────────────────────
  // SUCCESS VIEW (after submission)
  // ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Card style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <CheckCircleOutlined
            style={{ fontSize: 64, color: "#52c41a", marginBottom: 16 }}
          />
          <h2 style={{ marginBottom: 8 }}>Request Posted! 🎉</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Professionals matching your request will contact you soon.
          </p>

          <div
            style={{
              background: "#f9f9f9",
              padding: 16,
              borderRadius: 8,
              textAlign: "left",
              marginBottom: 24,
            }}
          >
            <p style={{ margin: "8px 0" }}>
              <strong>📧</strong> Check your email for quote notifications
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>📱</strong> You'll get SMS alerts for urgent requests
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>🔔</strong> Manage responses in your dashboard
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button onClick={() => (window.location.href = "/dashboard")}>
              Go to Dashboard
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setSubmitted(false);
                setStep(0);
                reset();
                form.resetFields();
                setPhotoPreviews([]);
              }}
            >
              Post Another Request
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────
  // FORM STEPS
  // ─────────────────────────────────────────────────────────

  const steps = [
    {
      title: "Service",
      content: (
        <>
          <Form.Item
            name="category"
            label="What service do you need?"
            rules={[{ required: true, message: "Please select a category" }]}
            initialValue={data.category}
          >
            <Select
              placeholder="Select a service category"
              options={SERVICE_CATEGORIES}
              onChange={handleCategoryChange}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>

          <Form.Item
            name="subcategory"
            label="Be more specific"
            rules={[{ required: true, message: "Please specify the service" }]}
            initialValue={data.subcategory}
          >
            <Select
              placeholder="Select the specific service"
              options={
                selectedCategory ? SERVICE_SUBCATEGORIES[selectedCategory] : []
              }
              disabled={!selectedCategory}
              onChange={handleSubcategoryChange}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>

          {/* Dynamic fields based on subcategory */}
          {dynamicFields.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: "16px",
                background: "#f9f9f9",
                borderRadius: 8,
              }}
            >
              <p style={{ margin: "0 0 12px", fontWeight: 500 }}>
                Additional details
              </p>
              {dynamicFields.map((field) => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={[{ required: false }]}
                  style={{ marginBottom: 12 }}
                >
                  {field.type === "select" ? (
                    <Select
                      placeholder={field.placeholder}
                      options={field.options}
                    />
                  ) : field.type === "number" ? (
                    <Input type="number" placeholder={field.placeholder} />
                  ) : field.type === "date" ? (
                    <Input type="date" />
                  ) : (
                    <Input placeholder={field.placeholder} />
                  )}
                </Form.Item>
              ))}
            </div>
          )}

          <Form.Item
            name="description"
            label="Describe what you need"
            rules={[
              { required: true, message: "Please describe your request" },
              { min: 20, message: "Please provide at least 20 characters" },
            ]}
            extra={`${
              form.getFieldValue("description")?.length || 0
            }/500 characters`}
            initialValue={data.description}
          >
            <Input.TextArea
              rows={4}
              placeholder="e.g. I need a plumber to fix a leaking kitchen sink. The leak started yesterday and is getting worse..."
              maxLength={500}
              showCount={false}
            />
          </Form.Item>

          <Form.Item
            label="Add photos"
            extra="Help professionals understand your request better (optional)"
          >
            <Upload
              listType="picture-card"
              multiple
              maxCount={5}
              accept="image/*"
              fileList={photoPreviews.map((src, i) => ({
                uid: `-${i}`,
                name: `image-${i}.jpg`,
                status: "done",
                url: src,
              }))}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  message.error("You can only upload image files!");
                  return Upload.LIST_IGNORE;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error("Image must be smaller than 5MB!");
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              onChange={handlePhotoUpload}
              onRemove={(file) => {
                const index = photoPreviews.indexOf(file.url || "");
                if (index > -1) removePhoto(index);
              }}
            >
              {photoPreviews.length >= 5 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </>
      ),
    },

    {
      title: "Location",
      content: (
        <>
          <Form.Item
            name="serviceLocation"
            label="Where do you need the service?"
            rules={[{ required: true, message: "Please select a state" }]}
            initialValue={data.serviceLocation}
          >
            <Select
              placeholder="Select state"
              options={NIGERIAN_STATES.map((state) => ({
                value: state,
                label: state,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address / Landmark (optional)"
            extra="Your exact address is only shared with professionals you accept"
            initialValue={data.address}
          >
            <Input
              placeholder="e.g. Near Shoprite, Victoria Island"
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>

          <Form.Item
            name="serviceType"
            label="Service location type"
            rules={[{ required: true, message: "Please select an option" }]}
            initialValue={data.serviceType}
          >
            <Select
              options={[
                { value: "home", label: "🏠 At my home" },
                { value: "business", label: "🏢 At my business" },
                { value: "remote", label: "💻 Remote / Online" },
                { value: "other", label: "📍 Other location" },
              ]}
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Budget & Time",
      content: (
        <>
          <Form.Item
            name="budget"
            label="Your budget range"
            rules={[
              { required: true, message: "Please select a budget range" },
            ]}
            initialValue={data.budget}
          >
            <Select
              placeholder="Select your budget"
              options={BUDGET_RANGES}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    <InfoCircleOutlined style={{ marginRight: 4 }} />
                    Not sure? Select "Flexible" to get quotes from professionals
                  </div>
                </>
              )}
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>

          <Form.Item
            name="urgency"
            label="When do you need this done?"
            rules={[{ required: true, message: "Please select a timeline" }]}
            initialValue={data.urgency}
          >
            <Select
              options={URGENCY_OPTIONS}
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>

          <Form.Item
            name="preferredDate"
            label="Preferred date (optional)"
            initialValue={data.preferredDate}
          >
            <Input
              type="date"
              style={{ width: "100%" }}
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Review",
      content: (
        <div>
          <Card
            size="small"
            title="Request Summary"
            style={{ marginBottom: 16 }}
          >
            <div style={{ lineHeight: "2.2" }}>
              <p>
                <strong>🔧 Service:</strong>{" "}
                {
                  SERVICE_CATEGORIES.find((c) => c.value === data.category)
                    ?.label
                }{" "}
                →{" "}
                {SERVICE_SUBCATEGORIES[data.category as ServiceCategory]?.find(
                  (s) => s.value === data.subcategory
                )?.label || data.subcategory}
              </p>
              <p>
                <strong>📝 Description:</strong> {data.description || "—"}
              </p>

              {photoPreviews.length > 0 && (
                <p>
                  <strong>📷 Photos:</strong> {photoPreviews.length} attached
                </p>
              )}

              <p>
                <strong>📍 Location:</strong> {data.serviceLocation}
                {data.address ? `, ${data.address}` : ""}
              </p>
              <p>
                <strong>🏠 Service at:</strong>{" "}
                {{
                  home: "My home",
                  business: "My business",
                  remote: "Remote/Online",
                  other: "Other",
                }[data.serviceType as string] || "—"}
              </p>
              <p>
                <strong>💰 Budget:</strong>{" "}
                {BUDGET_RANGES.find((b) => b.value === data.budget)?.label ||
                  "—"}
              </p>
              <p>
                <strong>⏰ Timeline:</strong>{" "}
                {URGENCY_OPTIONS.find((u) => u.value === data.urgency)?.label ||
                  "—"}
              </p>
              {data.preferredDate && (
                <p>
                  <strong>📅 Preferred date:</strong> {data.preferredDate}
                </p>
              )}
            </div>
          </Card>

          <div
            style={{
              padding: "12px 16px",
              background: "#f0f9ff",
              borderRadius: 8,
              border: "1px solid #bae7ff",
            }}
          >
            <small style={{ color: "#1890ff" }}>
              <CheckCircleOutlined style={{ marginRight: 4 }} />
              By posting, you agree to our{" "}
              <a href="/terms" target="_blank" rel="noopener">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener">
                Privacy Policy
              </a>
              . Professionals will contact you via your selected methods.
            </small>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Progress Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 8px" }}>Post a Request</h2>
        <p style={{ margin: 0, color: "#666" }}>
          Step {step + 1} of {steps.length} • {steps[step].title}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 32,
          alignItems: "flex-start",
        }}
      >
        {/* Steps Navigation */}
        <div style={{ width: isMobile ? "100%" : 180, flexShrink: 0 }}>
          <Steps
            orientation={isMobile ? "horizontal" : "vertical"}
            current={step}
            items={steps.map((s) => ({ title: s.title }))}
            size="small"
            style={{ overflowX: isMobile ? "auto" : "visible" }}
          />
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Divider style={{ margin: "0 0 24px" }} dashed />

          <Form form={form} layout="vertical" onFinish={submit}>
            {steps[step].content}

            {/* Navigation Buttons */}
            <div
              style={{
                marginTop: 32,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {step > 0 && (
                <Button onClick={prev} size={isMobile ? "middle" : "large"}>
                  ← Back
                </Button>
              )}

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {/* Save Draft - optional */}
                {step < steps.length - 1 && (
                  <Button
                    onClick={() => {
                      form
                        .validateFields()
                        .then((values) => {
                          updateData(values);
                          message.info("Draft saved locally");
                        })
                        .catch(() => {
                          message.warning(
                            "Complete required fields to save draft"
                          );
                        });
                    }}
                    size={isMobile ? "middle" : "large"}
                  >
                    Save Draft
                  </Button>
                )}

                {step < steps.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={next}
                    size={isMobile ? "middle" : "large"}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size={isMobile ? "middle" : "large"}
                  >
                    Post Request ✨
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Card>
  );
}
