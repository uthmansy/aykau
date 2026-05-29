"use client";

import { useState } from "react";
import {
  Card,
  Steps,
  Form,
  Input,
  Button,
  Select,
  App,
  InputNumber,
  Upload,
  message as AntdMessage,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useOnboardingStore } from "@/store/onboarding.store";
import { Grid } from "antd";
import { NIGERIAN_STATES } from "@/constants/constants";

const { useBreakpoint } = Grid;

// Service categories similar to Bark.com
const SERVICE_CATEGORIES = [
  { value: "home-services", label: "Home Services" },
  { value: "events", label: "Events & Parties" },
  { value: "wellness", label: "Health & Wellness" },
  { value: "tech", label: "Tech & IT" },
  { value: "creative", label: "Creative & Design" },
  { value: "lessons", label: "Lessons & Tutoring" },
  { value: "automotive", label: "Automotive" },
  { value: "other", label: "Other" },
];

const SERVICE_SUBCATEGORIES: Record<
  string,
  { value: string; label: string }[]
> = {
  "home-services": [
    { value: "cleaning", label: "Cleaning" },
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "painting", label: "Painting & Decorating" },
    { value: "moving", label: "Moving & Delivery" },
    { value: "gardening", label: "Gardening" },
  ],
  events: [
    { value: "photography", label: "Photography" },
    { value: "catering", label: "Catering" },
    { value: "music", label: "Music & Entertainment" },
    { value: "planning", label: "Event Planning" },
  ],
  wellness: [
    { value: "massage", label: "Massage Therapy" },
    { value: "fitness", label: "Personal Training" },
    { value: "beauty", label: "Beauty & Hair" },
  ],
  tech: [
    { value: "web-dev", label: "Web Development" },
    { value: "repair", label: "Device Repair" },
    { value: "support", label: "IT Support" },
  ],
  creative: [
    { value: "graphic-design", label: "Graphic Design" },
    { value: "video", label: "Video Editing" },
    { value: "writing", label: "Content Writing" },
  ],
  lessons: [
    { value: "academic", label: "Academic Tutoring" },
    { value: "music-lessons", label: "Music Lessons" },
    { value: "language", label: "Language Lessons" },
  ],
  automotive: [
    { value: "mechanic", label: "Auto Repair" },
    { value: "detailing", label: "Car Detailing" },
    { value: "towing", label: "Towing & Recovery" },
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
  { value: "asap", label: "As soon as possible" },
  { value: "this-week", label: "Within this week" },
  { value: "this-month", label: "Within this month" },
  { value: "planning", label: "Just planning / Flexible" },
];

export default function JobPostingForm() {
  const [form] = Form.useForm();
  const { step, setStep, updateData, data } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    data?.category || null
  );

  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
      const finalData = { ...data, ...values };

      setLoading(true);

      console.log("CUSTOMER REQUEST:", finalData);

      // TODO: Supabase insert here - create customer request/lead
      // Example:
      // const { error } = await supabase
      //   .from('customer_requests')
      //   .insert({ ...finalData, status: 'pending', created_at: new Date() });

      message.success(
        "Request submitted! Professionals will contact you soon."
      );
    } catch (error) {
      message.error("Please complete required fields");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setFieldsValue({ subcategory: undefined }); // Reset subcategory when category changes
  };

  const steps = [
    {
      title: "Basic Info",
      content: (
        <>
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="e.g. Chioma Adeyemi" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter your phone number" },
              {
                pattern: /^0\d{10}$/,
                message: "Enter a valid Nigerian number (e.g. 08012345678)",
              },
            ]}
          >
            <Input placeholder="08012345678" maxLength={11} />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Service Needed",
      content: (
        <>
          <Form.Item
            name="category"
            label="What service do you need?"
            rules={[{ required: true, message: "Please select a category" }]}
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
            />
          </Form.Item>

          <Form.Item
            name="subcategory"
            label="Specific service"
            rules={[{ required: true, message: "Please specify the service" }]}
          >
            <Select
              placeholder="Select the specific service"
              options={
                selectedCategory ? SERVICE_SUBCATEGORIES[selectedCategory] : []
              }
              disabled={!selectedCategory}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Describe what you need"
            rules={[
              { required: true, message: "Please describe your request" },
              { min: 20, message: "Please provide at least 20 characters" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="e.g. I need a plumber to fix a leaking kitchen sink. The leak started yesterday and is getting worse..."
            />
          </Form.Item>

          <Form.Item
            label="Add photos (optional)"
            extra="Help professionals understand your request better"
          >
            <Upload
              multiple
              maxCount={5}
              accept="image/*"
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
                return false; // Prevent auto-upload
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Images</Button>
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
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address / Landmark (optional)"
            rules={[{ required: false }]}
          >
            <Input placeholder="e.g. Near Shoprite, Victoria Island" />
          </Form.Item>

          <Form.Item
            name="serviceType"
            label="Service location type"
            rules={[{ required: true, message: "Please select an option" }]}
          >
            <Select
              options={[
                { value: "home", label: "At my home" },
                { value: "business", label: "At my business" },
                { value: "remote", label: "Remote / Online" },
                { value: "other", label: "Other location" },
              ]}
            />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Budget & Timeline",
      content: (
        <>
          <Form.Item
            name="budget"
            label="Your budget range"
            rules={[
              { required: true, message: "Please select a budget range" },
            ]}
          >
            <Select
              placeholder="Select your budget"
              options={BUDGET_RANGES}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    💡 Not sure? Select "Flexible" to get quotes from
                    professionals
                  </div>
                </>
              )}
            />
          </Form.Item>

          <Form.Item
            name="urgency"
            label="When do you need this done?"
            rules={[{ required: true, message: "Please select a timeline" }]}
          >
            <Select options={URGENCY_OPTIONS} />
          </Form.Item>

          <Form.Item name="preferredDate" label="Preferred date (optional)">
            <Input type="date" />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Review",
      content: (
        <div>
          <Card size="small" title="Request Summary">
            <div style={{ lineHeight: "2" }}>
              <p>
                <strong>Name:</strong> {data.fullName || "—"}
              </p>
              <p>
                <strong>Email:</strong> {data.email || "—"}
              </p>
              <p>
                <strong>Phone:</strong> {data.phone || "—"}
              </p>
              <p>
                <strong>Service:</strong> {data.category} → {data.subcategory}
              </p>
              <p>
                <strong>Description:</strong> {data.description || "—"}
              </p>
              <p>
                <strong>Location:</strong> {data.serviceLocation}
                {data.address ? `, ${data.address}` : ""}
              </p>
              <p>
                <strong>Budget:</strong>{" "}
                {BUDGET_RANGES.find((b) => b.value === data.budget)?.label ||
                  "—"}
              </p>
              <p>
                <strong>Timeline:</strong>{" "}
                {URGENCY_OPTIONS.find((u) => u.value === data.urgency)?.label ||
                  "—"}
              </p>
            </div>
          </Card>

          <div
            style={{
              marginTop: 16,
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: 8,
            }}
          >
            <small>
              ⚠️ By submitting, you agree to our{" "}
              <a href="/terms" target="_blank">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank">
                Privacy Policy
              </a>
              . Professionals matching your request will contact you via email
              or phone.
            </small>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* STEPS */}
        <div
          style={{
            width: isMobile ? "100%" : 200,
            marginBottom: isMobile ? 20 : 0,
          }}
        >
          <Steps
            orientation={isMobile ? "horizontal" : "vertical"}
            current={step}
            items={steps.map((s) => ({ title: s.title }))}
            style={{
              width: "100%",
              overflowX: isMobile ? "auto" : "visible",
            }}
            size={isMobile ? "small" : "default"}
          />
        </div>

        {/* FORM */}
        <div style={{ flex: 1, width: "100%" }}>
          <h2 style={{ marginBottom: 8 }}>{steps[step].title}</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Step {step + 1} of {steps.length}
          </p>

          <Form form={form} layout="vertical" initialValues={data}>
            {steps[step].content}

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {step > 0 && (
                <Button onClick={prev} size={isMobile ? "middle" : "default"}>
                  Back
                </Button>
              )}

              <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                {step < steps.length - 1 && (
                  <Button
                    type="primary"
                    onClick={next}
                    size={isMobile ? "middle" : "default"}
                  >
                    Next
                  </Button>
                )}

                {step === steps.length - 1 && (
                  <Button
                    type="primary"
                    onClick={submit}
                    loading={loading}
                    size={isMobile ? "middle" : "default"}
                  >
                    Submit Request
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
