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
  Avatar,
  Typography,
  Tag,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
// 👇 Import the NEW customer store
import { useCustomerOnboardingStore } from "@/store/customerOnboarding.store";
import { Grid } from "antd";
import LocationSelect from "./jobs/LocationSelect";
import { supabase } from "@/services/supabase/client";
import { useOnboardingFormInitialValues } from "@/hooks/useOnboardingFormInitialValues";
import { appendOnboardingRole } from "@/lib/supabase/profiles";
import { capitalize } from "@/lib/helpers/functions";

const { useBreakpoint } = Grid;

interface OnboardingFormProps {
  onComplete?: () => void;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS (keep these in component or extract to /constants)
// ─────────────────────────────────────────────────────────────

const SERVICE_INTERESTS = [
  { value: "home-services", label: "Home Services" },
  { value: "events", label: "Events & Parties" },
  { value: "wellness", label: "Health & Wellness" },
  { value: "tech", label: "Tech & IT" },
  { value: "creative", label: "Creative & Design" },
  { value: "lessons", label: "Lessons & Tutoring" },
  { value: "automotive", label: "Automotive" },
  { value: "business", label: "Business Services" },
];

const COMMUNICATION_PREFS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone / SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "in-app", label: "In-App Notifications" },
];

const RESPONSE_TIMES = [
  { value: "immediate", label: "Within 1 hour" },
  { value: "same-day", label: "Same day" },
  { value: "24-hours", label: "Within 24 hours" },
  { value: "flexible", label: "No rush / Flexible" },
];

const BUDGET_STYLES = [
  { value: "fixed", label: "I prefer fixed-price quotes" },
  { value: "hourly", label: "I'm okay with hourly rates" },
  { value: "negotiable", label: "I like to negotiate" },
  { value: "open", label: "Open to suggestions from professionals" },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function CustomerOnboardingForm({
  onComplete,
}: OnboardingFormProps) {
  const [form] = Form.useForm();
  // 👇 Use the dedicated customer store
  const { step, setStep, updateData, data } = useCustomerOnboardingStore();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
      const finalData = {
        ...data,
        ...values,
        avatar: avatarFile?.name || data.avatar,
      };
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Handle avatar upload (optional)
      let avatarUrl = data.avatar;
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        avatarUrl = supabase.storage.from("avatars").getPublicUrl(fileName)
          .data.publicUrl;
      }

      // 🎯 CALL THE HELPER for customer role
      const roleUpdate = await appendOnboardingRole(user.id, "customer");

      const profilePayload = {
        id: user.id,
        full_name: finalData.fullName,
        phone: finalData.phone,
        nin: finalData.nin,
        bio: finalData.bio,
        post_code: finalData.postCode,
        address_preference: finalData.addressPreference,
        lga_id: finalData.lgaId,
        lga_name: finalData.lgaName,
        state_code: finalData.state,
        city: finalData.city,
        coordinates: finalData.lgaCoordinates,
        avatar_url: avatarUrl,

        // Customer-specific data
        customer_data: {
          serviceInterests: finalData.serviceInterests,
          responseTime: finalData.responseTime,
          budgetStyle: finalData.budgetStyle,
          communicationPrefs: finalData.communicationPrefs,
        },

        // 🔹 Merge the safe role update
        ...roleUpdate,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" });

      if (error) throw error;

      message.success("✅ Customer profile saved!");
      onComplete?.();
    } catch (err: any) {
      console.error("Submit error:", err);
      message.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };
  const handleAvatarChange = (info: any) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} upload failed`);
    }
    if (info.fileList[0]?.originFileObj) {
      setAvatarFile(info.fileList[0].originFileObj);
    }
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
            initialValue={data.fullName}
          >
            <Input placeholder="e.g. Chioma Adeyemi" />
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
            initialValue={data.phone}
          >
            <Input placeholder="08012345678" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="nin"
            label="NIN Number"
            rules={[
              { required: true },
              {
                pattern: /^\d{11}$/,
                message: "Enter a valid Nigerian NIN",
              },
            ]}
            initialValue={data.nin}
          >
            <Input maxLength={11} />
          </Form.Item>
        </>
      ),
    },

    {
      title: "About You",
      content: (
        <>
          <Form.Item
            name="bio"
            label="Tell professionals about yourself"
            rules={[
              { required: true, message: "Please write a short bio" },
              { min: 20, message: "Please provide at least 20 characters" },
              { max: 300, message: "Bio must be under 300 characters" },
            ]}
            extra="e.g. 'I'm a busy working parent in Lagos looking for reliable home services.'"
            initialValue={data.bio}
          >
            <Input.TextArea
              rows={4}
              placeholder="Share a bit about yourself and what you typically need help with..."
              showCount
              maxLength={300}
            />
          </Form.Item>

          <Form.Item
            name="serviceInterests"
            label="What services do you usually need?"
            rules={[
              {
                required: true,
                type: "array",
                message: "Select at least one category",
              },
            ]}
            extra="This helps us match you with the right professionals"
            initialValue={data.serviceInterests}
          >
            <Select
              mode="multiple"
              placeholder="Select categories"
              options={SERVICE_INTERESTS}
              maxTagCount="responsive"
              allowClear
            />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Location",
      content: <LocationSelect data={data} updateData={updateData} />,
    },

    {
      title: "Preferences",
      content: (
        <>
          <Form.Item
            name="responseTime"
            label="How quickly do you usually respond?"
            rules={[{ required: true }]}
            initialValue={data.responseTime}
          >
            <Select options={RESPONSE_TIMES} />
          </Form.Item>

          <Form.Item
            name="budgetStyle"
            label="How do you prefer to discuss pricing?"
            rules={[{ required: true }]}
            initialValue={data.budgetStyle}
          >
            <Select options={BUDGET_STYLES} />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Review",
      content: (
        <div style={{ padding: "0", maxWidth: 560, margin: "0 auto" }}>
          {/* 👤 Profile Header with Avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px dashed #e5e7eb",
            }}
          >
            {avatarFile ? (
              <Avatar size={64} src={URL.createObjectURL(avatarFile)} />
            ) : data.avatar ? (
              <Avatar size={64} src={data.avatar as string} />
            ) : (
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ background: "#f5f5f5", color: "#8c8c8c" }}
              />
            )}
            <div>
              <Typography.Text
                strong
                style={{ fontSize: 18, display: "block" }}
              >
                {data.fullName || "Your Name"}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                {data.phone || "—"}
              </Typography.Text>
            </div>
          </div>

          {/* 🔍 Verify Header */}
          <Typography.Text
            type="secondary"
            style={{ fontSize: 16, marginBottom: 20, display: "block" }}
          >
            Verify your details before submitting
          </Typography.Text>

          {/* 👤 Personal Info */}
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
              Personal Information
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
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 12,
                    borderBottom: "1px dashed #e5e7eb",
                  }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                    Full Name
                  </Typography.Text>
                  <Typography.Text strong style={{ textAlign: "right" }}>
                    {data.fullName || "—"}
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
                  <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                    Phone
                  </Typography.Text>
                  <Typography.Text style={{ textAlign: "right" }}>
                    {data.phone || "—"}
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
                  <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                    NIN
                  </Typography.Text>
                  <Typography.Text
                    style={{ textAlign: "right", fontFamily: "monospace" }}
                  >
                    {data.nin
                      ? data.nin.replace(/(\d{4})(\d{4})(\d{3})/, "$1 **** $3")
                      : "—"}
                  </Typography.Text>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                    Address Preference
                  </Typography.Text>
                  <Tag
                    color="default"
                    variant="solid"
                    style={{ margin: 0, borderRadius: 6 }}
                  >
                    {data.addressPreference?.replace("-", " ") || "—"}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          {/* 📍 Location */}
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
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: 12,
                    borderBottom: "1px dashed #e5e7eb",
                  }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                    Area
                  </Typography.Text>
                  <Typography.Text style={{ textAlign: "right" }}>
                    {[data.city, data.lgaName, data.state]
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
                  <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                    Postal Code
                  </Typography.Text>
                  <Typography.Text style={{ textAlign: "right" }}>
                    {data.postCode || "—"}
                  </Typography.Text>
                </div>
                {data.lgaCoordinates && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                      Coordinates
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    >
                      {data.lgaCoordinates.lat.toFixed(4)},{" "}
                      {data.lgaCoordinates.lng.toFixed(4)}
                    </Typography.Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔍 Service Preferences */}
          {data.serviceInterests && data.serviceInterests?.length > 0 && (
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
                Service Preferences
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
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: 12,
                      borderBottom: "1px dashed #e5e7eb",
                    }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                      Categories
                    </Typography.Text>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      {data.serviceInterests &&
                        data.serviceInterests.map((s) => (
                          <Tag
                            key={s}
                            variant="solid"
                            color="default"
                            style={{ margin: 0, borderRadius: 6 }}
                          >
                            {capitalize(s)}
                          </Tag>
                        ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: 12,
                      borderBottom: "1px dashed #e5e7eb",
                    }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                      Contact Via
                    </Typography.Text>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      {data.communicationPrefs?.length ? (
                        data.communicationPrefs.map((c) => (
                          <Tag
                            key={c}
                            variant="solid"
                            color="default"
                            style={{ margin: 0, borderRadius: 6 }}
                          >
                            {capitalize(c)}
                          </Tag>
                        ))
                      ) : (
                        <Typography.Text type="secondary">
                          Not specified
                        </Typography.Text>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: 12,
                      borderBottom: "1px dashed #e5e7eb",
                    }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                      Response Time
                    </Typography.Text>
                    <Tag
                      color="default"
                      variant="solid"
                      style={{ margin: 0, borderRadius: 6 }}
                    >
                      {data.responseTime?.replace("-", " ") || "—"}
                    </Tag>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                      Budget Style
                    </Typography.Text>
                    <Tag
                      color="default"
                      variant="solid"
                      style={{ margin: 0, borderRadius: 6 }}
                    >
                      {data.budgetStyle?.replace("-", " ") || "—"}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📝 Bio */}
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
              About You
            </Typography.Text>
            <div
              style={{
                background: "#fafafa",
                borderRadius: 12,
                padding: 16,
                border: "1px solid #f0f0f0",
              }}
            >
              <Typography.Paragraph
                ellipsis={{ rows: 4, expandable: true }}
                style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}
              >
                {data.bio || "No bio provided."}
              </Typography.Paragraph>
            </div>
          </div>

          {/* ✅ Privacy Notice */}
          <div
            style={{
              marginTop: 8,
              padding: "12px 16px",
              background: "#f0f9ff",
              borderRadius: 12,
              border: "1px solid #bae7ff",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>✅</span>
            <Typography.Text
              style={{ fontSize: 15, color: "#0369a1", lineHeight: 1.5 }}
            >
              Your profile is private. Only professionals you interact with will
              see your details.
            </Typography.Text>
          </div>
        </div>
      ),
    },
  ];

  useOnboardingFormInitialValues("customer", useCustomerOnboardingStore, form);

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
            size={isMobile ? "small" : "medium"}
          />
        </div>

        {/* FORM */}
        <div style={{ flex: 1, width: "100%" }}>
          <h2 style={{ marginBottom: 8 }}>{steps[step].title}</h2>
          <Form form={form} layout="vertical">
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
                <Button onClick={prev} size={isMobile ? "middle" : "medium"}>
                  Back
                </Button>
              )}

              <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                {step < steps.length - 1 && (
                  <Button
                    type="primary"
                    onClick={next}
                    size={isMobile ? "middle" : "medium"}
                  >
                    Next
                  </Button>
                )}

                {step === steps.length - 1 && (
                  <Button
                    type="primary"
                    onClick={submit}
                    loading={loading}
                    size={isMobile ? "middle" : "medium"}
                  >
                    Complete Profile
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
