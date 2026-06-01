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
  Typography,
  Descriptions,
  Tag,
  Space,
  Avatar,
} from "antd";
import { useArtisanOnboardingStore } from "@/store/artisanOnboarding.store";
import { Grid } from "antd";
import { getLgasByState } from "@/lib/helpers/location";
import LocationSelect from "./jobs/LocationSelect";
import { supabase } from "@/services/supabase/client";
import { useOnboardingFormInitialValues } from "@/hooks/useOnboardingFormInitialValues";
import { appendOnboardingRole } from "@/lib/supabase/profiles";
import { capitalize } from "@/lib/helpers/functions";
import { UserOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

interface OnboardingFormProps {
  onComplete?: () => void;
}

export default function ArtisanOnboardingForm({
  onComplete,
}: OnboardingFormProps) {
  const [form] = Form.useForm();
  const stateCode = Form.useWatch("state", form);
  const lgas = stateCode ? getLgasByState(stateCode) : [];
  const { step, setStep, updateData, data } = useArtisanOnboardingStore();
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
      const finalData = { ...data, ...values };
      setLoading(true);

      // 1. Get Supabase client + user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 2. 🎯 CALL THE HELPER to safely append role
      const roleUpdate = await appendOnboardingRole(user.id, "artisan");

      // 3. Build the full profile payload
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

        // Artisan-specific data
        artisan_data: {
          professions: finalData.professions,
          skills: finalData.skills,
          experience: finalData.experience,
          hourlyRate: finalData.hourlyRate,
        },

        // 🔹 Merge the safe role update
        ...roleUpdate,
      };

      // 4. Upsert to Supabase
      const { error } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" });

      if (error) throw error;

      message.success("Artisan profile saved!");
      onComplete?.();
    } catch (err: any) {
      console.error("Submit error:", err);
      message.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
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
            rules={[{ required: true }]}
          >
            <Input />
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
          >
            <Input maxLength={11} />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Professions",
      content: (
        <>
          <Form.Item
            name="professions"
            label="What do you do?"
            rules={[
              {
                required: true,
                type: "array",
                message: "Please select at least one profession",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select your professions"
              allowClear
              maxTagCount="responsive"
              options={[
                { value: "plumber", label: "Plumber" },
                { value: "electrician", label: "Electrician" },
                { value: "cleaner", label: "Cleaner" },
                { value: "mechanic", label: "Mechanic" },
                { value: "designer", label: "Designer" },
              ]}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="skills" label="Skills (press enter to add)">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="e.g. wiring, repairs, installations"
            />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Experience",
      content: (
        <>
          <Form.Item
            name="experience"
            label="Years of Experience"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "0-1", label: "0-1 years" },
                { value: "2-5", label: "2-5 years" },
                { value: "5-10", label: "5-10 years" },
                { value: "10+", label: "10+ years" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="hourlyRate"
            label="Hourly Rate (₦)"
            rules={[
              { required: true, message: "Please enter the hourly rate" },
            ]}
          >
            <InputNumber<number>
              placeholder="e.g. 5000"
              style={{ width: "100%" }}
              formatter={(value) =>
                `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => {
                const cleaned = value?.replace(/[₦\s,]/g, "");
                return cleaned ? Number(cleaned) : 0;
              }}
              step="0.01"
              min={0}
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
      title: "Bio",
      content: (
        <Form.Item
          name="bio"
          label="Tell customers about yourself"
          rules={[{ required: true, min: 20 }]}
        >
          <Input.TextArea rows={5} />
        </Form.Item>
      ),
    },

    {
      title: "Review",
      content: (
        <div style={{ padding: "0", maxWidth: 560, margin: "0 auto" }}>
          {/* Header */}
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
          <div style={{ marginBottom: 24 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 16, marginTop: 4, display: "block" }}
            >
              Verify your details before submitting
            </Typography.Text>
          </div>

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
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                    Postal Code
                  </Typography.Text>
                  <Typography.Text style={{ textAlign: "right" }}>
                    {data.postCode || "—"}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </div>

          {/* 🛠️ Artisan Fields (only render if present) */}
          {data.professions && data.professions?.length > 0 && (
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
                Professional Details
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
                      Professions
                    </Typography.Text>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      {data.professions &&
                        data.professions.map((p) => (
                          <Tag
                            key={p}
                            variant="solid"
                            color="default"
                            style={{ margin: 0, borderRadius: 6 }}
                          >
                            {capitalize(p)}
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
                      Skills
                    </Typography.Text>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      {data.skills?.length ? (
                        data.skills.map((s) => (
                          <Tag
                            key={s}
                            variant="solid"
                            color="default"
                            style={{ margin: 0, borderRadius: 6 }}
                          >
                            {capitalize(s)}
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
                      Experience
                    </Typography.Text>
                    <Typography.Text style={{ textAlign: "right" }}>
                      {data.experience} years
                    </Typography.Text>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                      Hourly Rate
                    </Typography.Text>
                    <Typography.Text strong>
                      ₦ {(data.hourlyRate ?? 0).toLocaleString("en-NG")}
                    </Typography.Text>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🔍 Customer Fields (only render if present) */}
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
                            color="purple"
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
                      Response Time
                    </Typography.Text>
                    <Tag color="orange" style={{ margin: 0, borderRadius: 6 }}>
                      {data.responseTime?.replace("-", " ") || "—"}
                    </Tag>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                      Budget Style
                    </Typography.Text>
                    <Tag color="cyan" style={{ margin: 0, borderRadius: 6 }}>
                      {data.budgetStyle?.replace("-", " ") || "—"}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📝 Bio */}
          <div>
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
        </div>
      ),
    },
  ];

  useOnboardingFormInitialValues("artisan", useArtisanOnboardingStore, form);

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
          />
        </div>

        {/* FORM */}
        <div style={{ flex: 1, width: "100%" }}>
          <h2 style={{ marginBottom: 20 }}>{steps[step].title}</h2>

          <Form form={form} layout="vertical" initialValues={data}>
            {steps[step].content}

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {step > 0 && <Button onClick={prev}>Back</Button>}

              {step < steps.length - 1 && (
                <Button type="primary" onClick={next}>
                  Next
                </Button>
              )}

              {step === steps.length - 1 && (
                <Button type="primary" onClick={submit} loading={loading}>
                  Finish Profile
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
    </Card>
  );
}
