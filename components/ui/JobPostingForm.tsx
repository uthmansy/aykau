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
import { useJobPostStore } from "@/store/jobPostForm.store";
import { supabase } from "@/services/supabase/client";
import { ServiceCategory } from "@/types/db";
import LocationSelect from "./jobs/LocationSelect";
import MapPinSelector from "./MapPinSelector";
import {
  Category,
  fetchCategoriesWithSubcategories,
} from "@/lib/helpers/categories";

const { useBreakpoint } = Grid;

export interface JobPostData {
  category?: ServiceCategory;
  subcategory?: string;
  description?: string;
  title?: string;
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
};

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
  const [categories, setCategories] = useState<Category[]>([]);

  // ✅ Shared Design System Classes
  const inputClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! h-12! px-4! font-inter! text-[16px]! focus:ring-1! focus:ring-primary/30!";
  const selectClasses =
    "w-full! [&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-12! [&_.ant-select-selector]:shadow-none! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[16px]!";
  const textAreaClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! py-3! px-4! font-inter! text-[16px]! focus:ring-1! focus:ring-primary/30! resize-none!";
  const labelClass =
    "font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant";

  useEffect(() => {
    fetchCategoriesWithSubcategories().then(setCategories);
  }, []);

  const categoryOptions = categories.map((c) => ({
    value: c.value,
    label: `${c.icon || ""} ${c.label}`,
  }));
  const getSubcategoryOptions = (categoryValue: string) =>
    categories
      .find((c) => c.value === categoryValue)
      ?.subcategories?.map((s) => ({ value: s.value, label: s.label })) || [];

  const dynamicFields = useMemo(
    () =>
      selectedSubcategory ? DYNAMIC_FIELDS[selectedSubcategory] || [] : [],
    [selectedSubcategory]
  );

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const finalData: JobPostData = { ...data, ...values };
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return message.error("Please log in to post a request");

      setLoading(true);
      const jobId = crypto.randomUUID();
      let photoPaths: string[] = [];

      if (finalData.photos?.length) {
        photoPaths = await Promise.all(
          finalData.photos.map(async (file: File) => {
            const ext = file.name.split(".").pop() || "jpg";
            const path = `${user.id}/${jobId}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
            const { error } = await supabase.storage
              .from("job-photos")
              .upload(path, file, { contentType: file.type });
            if (error) throw error;
            return path;
          })
        );
      }

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

      const { error: dbError } = await supabase.from("job_requests").insert({
        id: jobId,
        customer_id: user.id,
        category: finalData.category,
        subcategory: finalData.subcategory,
        description: finalData.description,
        title: finalData.title,
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
  const handleSubcategoryChange = (value: string) =>
    setSelectedSubcategory(value);

  const handlePhotoUpload = (info: any) => {
    if (info.file.status === "done")
      message.success(`${info.file.name} uploaded`);
    if (info.file.status === "error")
      message.error(`${info.file.name} upload failed`);
    const newPreviews = info.fileList
      .filter((f: any) => f.originFileObj)
      .map((f: any) => URL.createObjectURL(f.originFileObj));
    setPhotoPreviews(newPreviews);
    form.setFieldsValue({
      photos: info.fileList.map((f: any) => f.originFileObj).filter(Boolean),
    });
  };

  const removePhoto = (index: number) => {
    const newPreviews = [...photoPreviews];
    newPreviews.splice(index, 1);
    setPhotoPreviews(newPreviews);
    const newFiles = [...(form.getFieldValue("photos") || [])];
    newFiles.splice(index, 1);
    form.setFieldsValue({ photos: newFiles });
  };

  const saveDraft = () => {
    form
      .validateFields()
      .then((values) => {
        updateData(values);
        message.info("Draft saved locally");
      })
      .catch(() => message.warning("Complete required fields to save draft"));
  };

  const steps = [
    {
      title: "Service",
      content: (
        <>
          <Form.Item
            name="category"
            label={
              <span className={labelClass}>What service do you need?</span>
            }
            rules={[{ required: true, message: "Please select a category" }]}
            initialValue={data.category}
            className="mb-4!"
          >
            <Select
              placeholder="Select a service category"
              options={categoryOptions}
              onChange={handleCategoryChange}
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
            label={<span className={labelClass}>Be more specific</span>}
            rules={[{ required: true, message: "Please specify the service" }]}
            initialValue={data.subcategory}
            className="mb-4!"
          >
            <Select
              placeholder="Select the specific service"
              options={
                selectedCategory ? getSubcategoryOptions(selectedCategory) : []
              }
              disabled={!selectedCategory}
              onChange={handleSubcategoryChange}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              className={selectClasses}
            />
          </Form.Item>
          {dynamicFields.length > 0 && (
            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20 space-y-4 mt-6">
              <h4 className={labelClass}>Additional Details</h4>
              {dynamicFields.map((field) => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={
                    <span className="font-inter text-[14px] font-medium text-on-surface">
                      {field.label}
                    </span>
                  }
                  className="mb-0!"
                >
                  {field.type === "select" ? (
                    <Select
                      placeholder={field.placeholder}
                      options={field.options}
                      className={selectClasses}
                    />
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
          )}
        </>
      ),
    },
    {
      title: "More Info",
      content: (
        <>
          <Form.Item
            name="title"
            label={<span className={labelClass}>Job Title</span>}
            initialValue={data.title}
            className="mb-4!"
          >
            <Input
              placeholder="e.g. Interior Designer Needed For my New Apartment."
              className={inputClasses}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={<span className={labelClass}>Describe what you need</span>}
            rules={[
              { required: true, message: "Please describe your request" },
              { min: 20, message: "Please provide at least 20 characters" },
            ]}
            initialValue={data.description}
            className="mb-4!"
            extra={
              <span className="font-inter text-[12px] text-outline mt-1 block">
                {form.getFieldValue("description")?.length || 0}/500 characters
              </span>
            }
          >
            <Input.TextArea
              rows={4}
              placeholder="e.g. I need a plumber to fix a leaking kitchen sink..."
              maxLength={500}
              showCount={false}
              className={textAreaClasses}
            />
          </Form.Item>
          <Form.Item
            name="frequency"
            label={
              <span className={labelClass}>
                How often do you need this service?
              </span>
            }
            initialValue={data.frequency}
            className="mb-4!"
          >
            <Select
              options={[
                { value: "once", label: "One-time" },
                { value: "weekly", label: "Weekly" },
                { value: "biweekly", label: "Every 2 weeks" },
                { value: "monthly", label: "Monthly" },
              ]}
              placeholder="Select frequency"
              className={selectClasses}
            />
          </Form.Item>
          <Form.Item
            label={<span className={labelClass}>Add photos</span>}
            name="photos"
            extra={
              <span className="font-inter text-[12px] text-outline mt-1 block">
                Help professionals understand your request better (optional)
              </span>
            }
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
                if (!file.type.startsWith("image/")) {
                  message.error("You can only upload image files!");
                  return Upload.LIST_IGNORE;
                }
                if (file.size / 1024 / 1024 > 5) {
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
              className="[&_.ant-upload-list-item-container]:rounded-lg! [&_.ant-upload-list-item]:rounded-lg! [&_.ant-upload-select]:rounded-lg! [&_.ant-upload-select]:border-outline-variant! [&_.ant-upload-select]:bg-surface-container!"
            >
              {photoPreviews.length >= 5 ? null : (
                <div className="flex flex-col items-center justify-center h-full">
                  <PlusOutlined className="text-2xl text-primary mb-2" />
                  <span className="font-inter text-[12px] text-on-surface-variant">
                    Upload
                  </span>
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
            label={<span className={labelClass}>Service location type</span>}
            rules={[{ required: true, message: "Please select an option" }]}
            initialValue={data.serviceType}
            className="mb-4!"
          >
            <Select
              options={[
                { value: "home", label: "🏠 At my home" },
                { value: "business", label: "🏢 At my business" },
                { value: "remote", label: "💻 Remote / Online" },
                { value: "other", label: "📍 Other location" },
              ]}
              className={selectClasses}
            />
          </Form.Item>
          {serviceLocationType !== "remote" && (
            <>
              <LocationSelect updateData={updateData} />
              <Form.Item
                name="address"
                label={
                  <span className={labelClass}>
                    Address / Landmark (optional)
                  </span>
                }
                extra={
                  <span className="font-inter text-[12px] text-outline mt-1 block">
                    Your exact address is only shared with professionals you
                    accept
                  </span>
                }
                initialValue={data.address}
                className="mb-4!"
              >
                <Input
                  placeholder="e.g. Near Shoprite, Victoria Island"
                  className={inputClasses}
                />
              </Form.Item>
              <Form.Item
                name="accessNotes"
                label={
                  <span className={labelClass}>
                    Access instructions (optional)
                  </span>
                }
                extra={
                  <span className="font-inter text-[12px] text-outline mt-1 block">
                    e.g. Gate code, parking info, building floor
                  </span>
                }
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Help professionals arrive prepared"
                  className={textAreaClasses}
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
                label={<span className={labelClass}>Map Coordinates</span>}
                rules={[
                  {
                    required: true,
                    message:
                      "Please click or drag the pin to select a location",
                  },
                ]}
              >
                <MapPinSelector
                  defaultCoords={{
                    lat: data.lgaCoordinates?.lat || 0,
                    lng: data.lgaCoordinates?.lng || 0,
                  }}
                  height="400px"
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
            label={<span className={labelClass}>Your budget range</span>}
            rules={[
              { required: true, message: "Please select a budget range" },
            ]}
            initialValue={data.budget}
            className="mb-4!"
          >
            <Select
              placeholder="Select your budget"
              options={BUDGET_RANGES}
              className={selectClasses}
            />
          </Form.Item>
          <Form.Item
            name="urgency"
            label={
              <span className={labelClass}>When do you need this done?</span>
            }
            rules={[{ required: true, message: "Please select a timeline" }]}
            initialValue={data.urgency}
            className="mb-4!"
          >
            <Select options={URGENCY_OPTIONS} className={selectClasses} />
          </Form.Item>
          <Form.Item
            name="preferredDate"
            label={
              <span className={labelClass}>Preferred date (optional)</span>
            }
            initialValue={data.preferredDate}
          >
            <Input type="date" className={inputClasses} />
          </Form.Item>
        </>
      ),
    },
    {
      title: "Review",
      content: (
        <div className="space-y-6">
          <h3 className={labelClass}>Request Summary</h3>
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 space-y-4">
            {[
              {
                label: "Service",
                value: `${categories.find((c) => c.value === data.category)?.label || data.category} → ${categories.find((c) => c.value === data.category)?.subcategories.find((s) => s.value === data.subcategory)?.label || data.subcategory}`,
              },
              { label: "Title", value: data.title || "—" },
              { label: "Description", value: data.description || "—" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between font-inter text-[14px] gap-4"
              >
                <span className="text-on-surface-variant shrink-0">
                  {item.label}
                </span>
                <span className="text-on-surface font-medium text-right">
                  {item.value}
                </span>
              </div>
            ))}
            {photoPreviews.length > 0 && (
              <div className="flex justify-between font-inter text-[14px]">
                <span className="text-on-surface-variant">Photos</span>
                <span className="text-on-surface font-medium">
                  {photoPreviews.length} attached
                </span>
              </div>
            )}
          </div>

          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 space-y-4">
            <h4 className={labelClass}>Location Details</h4>
            <div className="flex justify-between font-inter text-[14px]">
              <span className="text-on-surface-variant">Area</span>
              <span className="text-on-surface font-medium text-right">
                {[data.lgaName, data.state].filter(Boolean).join(", ") || "—"}
              </span>
            </div>
            <div className="flex justify-between font-inter text-[14px]">
              <span className="text-on-surface-variant">Map Coordinates</span>
              <span className="text-on-surface font-medium text-right font-mono text-[12px]">
                {[data.mapCoordinates?.lat, data.mapCoordinates?.lng]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </div>
            <div className="flex justify-between font-inter text-[14px]">
              <span className="text-on-surface-variant">Service at</span>
              <span className="text-on-surface font-medium text-right">
                {{
                  home: "My home",
                  business: "My business",
                  remote: "Remote/Online",
                  other: "Other",
                }[data.serviceType as string] || "—"}
              </span>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 space-y-4">
            <h4 className={labelClass}>Budget & Timeline</h4>
            <div className="flex justify-between font-inter text-[14px]">
              <span className="text-on-surface-variant">Budget</span>
              <span className="text-on-surface font-medium text-right">
                {BUDGET_RANGES.find((b) => b.value === data.budget)?.label ||
                  "—"}
              </span>
            </div>
            <div className="flex justify-between font-inter text-[14px]">
              <span className="text-on-surface-variant">Timeline</span>
              <span className="text-on-surface font-medium text-right">
                {URGENCY_OPTIONS.find((u) => u.value === data.urgency)?.label ||
                  "—"}
              </span>
            </div>
            {data.preferredDate && (
              <div className="flex justify-between font-inter text-[14px]">
                <span className="text-on-surface-variant">Preferred date</span>
                <span className="text-on-surface font-medium text-right">
                  {data.preferredDate}
                </span>
              </div>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex gap-3">
            <CheckCircleOutlined className="text-primary text-xl mt-0.5 flex-none" />
            <p className="font-inter text-[14px] text-on-surface-variant">
              By posting, you agree to our{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener"
                className="text-primary font-medium hover:underline"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener"
                className="text-primary font-medium hover:underline"
              >
                Privacy Policy
              </a>
              . Professionals will contact you via your selected methods.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const safeStep = Math.max(0, Math.min(step, steps.length - 1));
  useEffect(() => {
    if (step !== safeStep) setStep(safeStep);
  }, [step, safeStep, setStep]);

  const next = async () => {
    try {
      const values = await form.validateFields();
      updateData(values);
      setStep(safeStep + 1);
    } catch {
      message.error("Please complete required fields");
    }
  };
  const prev = () => setStep(safeStep - 1);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-success-emerald/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircleOutlined className="text-success-emerald text-4xl" />
        </div>
        <h2 className="font-manrope text-[32px] font-semibold text-primary mb-2">
          Request Posted! 🎉
        </h2>
        <p className="font-inter text-[16px] text-on-surface-variant mb-8">
          Professionals matching your request will contact you soon.
        </p>
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 text-left space-y-3 mb-8">
          <p className="font-inter text-[14px] text-on-surface flex items-center gap-2">
            📧 Check your email for quote notifications
          </p>
          <p className="font-inter text-[14px] text-on-surface flex items-center gap-2">
            📱 You'll get SMS alerts for urgent requests
          </p>
          <p className="font-inter text-[14px] text-on-surface flex items-center gap-2">
            🔔 Manage responses in your dashboard
          </p>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="rounded-lg! h-auto! py-3! px-6! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
          >
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
            className="rounded-lg! h-auto! py-3! px-8! bg-secondary! hover:bg-secondary/90! border-none! text-on-secondary! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
          >
            Post Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      <header>
        <h1 className="font-manrope text-[32px] font-semibold text-primary leading-tight">
          Post a Request
        </h1>
        <p className="font-inter text-[16px] text-on-surface-variant mt-2">
          Step {safeStep + 1} of {steps.length} • {steps[safeStep].title}
        </p>
      </header>

      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-48 shrink-0 mb-6 md:mb-0">
            <Steps
              orientation={isMobile ? "horizontal" : "vertical"}
              current={safeStep}
              items={steps.map((s) => ({ title: s.title }))}
              size="small"
              className="[&_.ant-steps-item-title]:font-inter! [&_.ant-steps-item-title]:text-[14px]!"
            />
          </div>

          <div className="flex-1 min-w-0 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-6 md:pt-0 md:pl-8">
            <Form
              form={form}
              layout="vertical"
              onFinish={submit}
              requiredMark={false}
              className="space-y-2"
            >
              {steps[safeStep].content}

              <div className="flex justify-between items-center flex-wrap gap-4 mt-8 pt-6 border-t border-outline-variant/20">
                {safeStep > 0 && (
                  <Button
                    onClick={prev}
                    className="rounded-lg! h-auto! py-3! px-6! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
                  >
                    ← Back
                  </Button>
                )}
                <div className="flex gap-3 ml-auto">
                  {safeStep < steps.length - 1 && (
                    <Button
                      onClick={saveDraft}
                      className="rounded-lg! h-auto! py-3! px-6! border-primary! text-primary! hover:bg-primary/5! bg-transparent! font-inter! text-[14px]! font-medium!"
                    >
                      Save Draft
                    </Button>
                  )}
                  {safeStep < steps.length - 1 && (
                    <Button
                      type="primary"
                      onClick={next}
                      className="rounded-lg! h-auto! py-3! px-8! bg-secondary! hover:bg-secondary/90! border-none! text-on-secondary! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
                    >
                      Next
                    </Button>
                  )}
                  {safeStep === steps.length - 1 && (
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      className="rounded-lg! h-auto! py-3! px-8! bg-secondary! hover:bg-secondary/90! border-none! text-on-secondary! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
                    >
                      Post Request ✨
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
