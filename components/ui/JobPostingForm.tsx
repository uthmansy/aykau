"use client";

import { useState, useMemo, useEffect } from "react";
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
  Checkbox,
  Typography,
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
import { supabase } from "@/services/supabase/client";
import { ServiceCategory } from "@/types/db";
import LocationSelect from "./jobs/LocationSelect";
import MapPinSelector from "./MapPinSelector";

const { useBreakpoint } = Grid;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface JobPostData {
  category?: ServiceCategory;
  subcategory?: string;
  description?: string;
  photos?: File[];
  serviceLocation?: string;
  address?: string;
  lgaId?: number;
  lgaName?: string;
  state?: string;
  lgaCoordinates?: { lat: number; lng: number };
  mapCoordinates?: { lat: number; lng: number };
  serviceType?: "home" | "business" | "remote" | "other";
  budget?: string;
  urgency?: string;
  frequency?: string;
  preferredDate?: string;
  contactMethod?: ("email" | "phone" | "whatsapp")[];
  customDetails?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "home-services", label: "🏠 Home Services" },
  { value: "events", label: "🎉 Events & Parties" },
  { value: "wellness", label: "💆 Health & Wellness" },
  { value: "tech", label: "💻 Tech & IT" },
  { value: "creative", label: "🎨 Creative & Design" },
  { value: "lessons", label: "📚 Lessons & Tutoring" },
  { value: "automotive", label: "🚗 Automotive" },
  { value: "other", label: "📦 Other" },
];

export const SERVICE_SUBCATEGORIES: Record<
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
        { value: "once", label: "One time" },
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

  const serviceLocationType = Form.useWatch("serviceType", form);
  const showMap =
    data.serviceType === "home" ||
    data.serviceType === "business" ||
    data.serviceType === "other";

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

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const finalData: JobPostData = { ...data, ...values };

      // 1️⃣ Auth check
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        message.error("Please log in to post a request");
        return;
      }

      setLoading(true);

      // 2️⃣ Generate job ID upfront (so we can use it for photo paths)
      const jobId = crypto.randomUUID();
      let photoPaths: string[] = [];

      // 3️⃣ Upload photos first (if any)
      if (finalData.photos?.length) {
        const uploadPromises = finalData.photos.map(async (file: File) => {
          const ext = file.name.split(".").pop() || "jpg";
          const path = `${user.id}/${jobId}/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}.${ext}`;

          const { error } = await supabase.storage
            .from("job-photos")
            .upload(path, file, { contentType: file.type });

          if (error) throw error;
          return path; // Store relative path, not full URL
        });

        photoPaths = await Promise.all(uploadPromises);
      }

      // 4️⃣ Extract dynamic fields (cleaning: numRooms, plumbing: issueType, etc.)
      const knownFields = [
        "category",
        "subcategory",
        "description",
        "photos",
        "serviceLocation",
        "address",
        "serviceType",
        "accessNotes",
        "budget",
        "urgency",
        "frequency",
        "preferredDate",
        "contactMethod",
      ];
      const customDetails = Object.fromEntries(
        Object.entries(values).filter(([key]) => !knownFields.includes(key))
      );

      // 5️⃣ Insert job request
      const { error: dbError } = await supabase.from("job_requests").insert({
        id: jobId,
        customer_id: user.id,
        category: finalData.category,
        subcategory: finalData.subcategory,
        description: finalData.description,
        photo_urls: photoPaths,
        address: finalData.address || null,
        service_type: finalData.serviceType,
        access_notes: values.accessNotes || null,
        budget: finalData.budget,
        urgency: finalData.urgency,
        frequency: finalData.frequency || null,
        preferred_date: finalData.preferredDate || null,
        contact_methods: finalData.contactMethod || ["email"],
        lga_id: finalData.lgaId,
        lga_name: finalData.lgaName,
        state: finalData.state,
        coordinates: finalData.mapCoordinates,
        custom_details: customDetails,
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });

      if (dbError) throw dbError;

      message.success("Request posted! You'll receive quotes within 24 hours.");
      setSubmitted(true);
      reset();
    } catch (err: any) {
      console.error("Job post failed:", err);
      message.error(err.message || "Failed to submit request");
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
        </>
      ),
    },
    {
      title: "More Info",
      content: (
        <>
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
            name="frequency"
            label="How often do you need this service?"
            initialValue={data.frequency}
          >
            <Select
              options={[
                { value: "once", label: "One-time" },
                { value: "weekly", label: "Weekly" },
                { value: "biweekly", label: "Every 2 weeks" },
                { value: "monthly", label: "Monthly" },
              ]}
              placeholder="Select frequency"
            />
          </Form.Item>
          <Form.Item
            label="Add photos"
            name="photos"
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
          {serviceLocationType !== "remote" && (
            <>
              <LocationSelect updateData={updateData} />
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
                name="accessNotes"
                label="Access instructions (optional)"
                extra="e.g. Gate code, parking info, building floor"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Help professionals arrive prepared"
                />
              </Form.Item>
            </>
          )}
        </>
      ),
    },
    ...(showMap
      ? [
          {
            title: "Map",
            content: (
              <Form.Item
                name="mapCoordinates"
                label="Map Coordinates"
                rules={[
                  {
                    required: true,
                    message:
                      "Please click or drag the pin to select a location",
                  },
                ]}
                // Ant Design expects `value` and `onChange` by default.
                // No extra props needed here.
              >
                <MapPinSelector
                  defaultCoords={{
                    lat: data.lgaCoordinates?.lat || 0,
                    lng: data.lgaCoordinates?.lng || 0,
                  }}
                  height="350px"
                />
              </Form.Item>
            ),
          },
        ]
      : []),

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
              popupRender={(menu) => (
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

              <div style={{ marginBottom: 20 }}>
                <Typography.Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Location
                </Typography.Text>
                <div
                  style={{
                    background: "#fafafa",
                    borderRadius: 12,
                    padding: 16,
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingBottom: 12,
                        borderBottom: "1px dashed #e5e7eb",
                      }}
                    >
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 15 }}
                      >
                        Area
                      </Typography.Text>
                      <Typography.Text style={{ textAlign: "right" }}>
                        {[
                          data.lgaName,
                          data.state,
                          data.lgaCoordinates?.lat,
                          data.lgaCoordinates?.lng,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </Typography.Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingBottom: 12,
                        borderBottom: "1px dashed #e5e7eb",
                      }}
                    >
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 15 }}
                      >
                        Map Coordinates
                      </Typography.Text>
                      <Typography.Text style={{ textAlign: "right" }}>
                        {[data.mapCoordinates?.lat, data.mapCoordinates?.lng]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </Typography.Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 15 }}
                      >
                        Postal Code
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </div>
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

  const safeStep = Math.max(0, Math.min(step, steps.length - 1));
  useEffect(() => {
    if (step !== safeStep) {
      setStep(safeStep);
    }
  }, [step, safeStep, setStep]);

  const next = async () => {
    try {
      const values = await form.validateFields();
      updateData(values);
      setStep(safeStep + 1); // <-- Use safeStep
    } catch {
      message.error("Please complete required fields");
    }
  };

  const prev = () => setStep(safeStep - 1); // <-- Use safeStep

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

  return (
    <Card style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Progress Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 8px" }}>Post a Request</h2>
        <p style={{ margin: 0, color: "#666" }}>
          Step {safeStep + 1} of {steps.length} • {steps[safeStep].title}{" "}
          {/* <-- Updated */}
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
            current={safeStep} // <-- Updated
            items={steps.map((s) => ({ title: s.title }))}
            size="small"
            style={{ overflowX: isMobile ? "auto" : "visible" }}
          />
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Divider style={{ margin: "0 0 24px" }} dashed />

          <Form form={form} layout="vertical" onFinish={submit}>
            {steps[safeStep].content} {/* <-- Updated */}
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
              {safeStep > 0 && ( // <-- Updated
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
                {/* Save Draft */}
                {safeStep < steps.length - 1 && ( // <-- Updated
                  <Button
                    htmlType="button"
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

                {safeStep < steps.length - 1 && ( // <-- Updated
                  <Button type="primary" onClick={next}>
                    Next
                  </Button>
                )}

                {safeStep === steps.length - 1 && ( // <-- Updated
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
