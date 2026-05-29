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
  Upload,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
// 👇 Import the NEW customer store
import { useCustomerOnboardingStore } from "@/store/customerOnboarding.store";
import { Grid } from "antd";
import { NIGERIAN_STATES } from "@/constants/constants";

const { useBreakpoint } = Grid;

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

export default function CustomerOnboardingForm() {
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

      console.log("CUSTOMER PROFILE:", finalData);

      // TODO: Supabase insert here
      // const { error } = await supabase
      //   .from('customers')
      //   .insert({ ...finalData, created_at: new Date(), status: 'active' });

      message.success(
        "Profile created successfully! You can now post requests."
      );

      // Optional: reset store after success
      // useCustomerOnboardingStore.getState().reset();
    } catch {
      message.error("Please complete required fields");
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
            style={{
              width: "12rem",
            }}
            label="Profile Photo"
          >
            <div>
              <Upload
                listType="picture-circle"
                maxCount={1}
                accept="image/*"
                showUploadList={false} // 👈 Hide default list to avoid duplicate preview
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    message.error("You can only upload image files!");
                    return Upload.LIST_IGNORE;
                  }
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error("Image must be smaller than 2MB!");
                    return Upload.LIST_IGNORE;
                  }
                  return false; // Prevent auto-upload
                }}
                onChange={handleAvatarChange}
              >
                {/* Upload trigger area - fixed 104x104px square */}
                <div
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: "50%",
                    border: "1px dashed #d9d9d9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    overflow: "hidden",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {avatarFile || data.avatar ? (
                    <>
                      <img
                        src={
                          avatarFile
                            ? URL.createObjectURL(avatarFile)
                            : (data.avatar as string)
                        }
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", // 👈 Prevents stretching, maintains aspect ratio
                          borderRadius: "50%",
                        }}
                      />
                      {/* Optional: overlay remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAvatarFile(null);
                          // If you store avatar URL in data, clear it too:
                          // updateData({ avatar: undefined });
                        }}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.6)",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          lineHeight: 1,
                          padding: 0,
                        }}
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", color: "#666" }}>
                      <UploadOutlined style={{ fontSize: 24 }} />
                      <div style={{ marginTop: 8, fontSize: 12 }}>Upload</div>
                    </div>
                  )}
                </div>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your name" }]}
            initialValue={data.fullName}
          >
            <Input placeholder="e.g. Chioma Adeyemi" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: false },
              { type: "email", message: "Please enter a valid email" },
            ]}
            initialValue={data.email}
          >
            <Input placeholder="you@example.com" disabled />
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
      content: (
        <>
          <Form.Item
            name="state"
            label="Which state are you based in?"
            rules={[{ required: true, message: "Please select your state" }]}
            initialValue={data.state}
          >
            <Select
              placeholder="Select your state"
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
            name="city"
            label="City / Area"
            rules={[
              { required: true, message: "Please enter your city or area" },
            ]}
            initialValue={data.city}
          >
            <Input placeholder="e.g. Ikeja, Lekki, Garki" />
          </Form.Item>
          <Form.Item
            name="postCode"
            label="Post Code"
            rules={[{ required: true, message: "Please enter your Post Code" }]}
            initialValue={data.postCode}
          >
            <Input placeholder="Your Post Code" />
          </Form.Item>

          <Form.Item
            name="addressPreference"
            label="How do you prefer to share your address?"
            rules={[{ required: true }]}
            extra="Your exact address is only shared with professionals you accept"
            initialValue={data.addressPreference}
          >
            <Select
              options={[
                {
                  value: "on-request",
                  label: "Share only when I accept a professional",
                },
                {
                  value: "after-booking",
                  label: "Share after booking is confirmed",
                },
                {
                  value: "landmark",
                  label: "Share landmark only (no exact address)",
                },
              ]}
            />
          </Form.Item>
        </>
      ),
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
        <div>
          <Card size="small" title="Profile Preview">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {avatarFile ? (
                <Avatar size={64} src={URL.createObjectURL(avatarFile)} />
              ) : data.avatar ? (
                <Avatar size={64} src={data.avatar as string} />
              ) : (
                <Avatar size={64} icon={<UserOutlined />} />
              )}
              <div>
                <strong>{data.fullName || "Your Name"}</strong>
                <div style={{ color: "#666", fontSize: 14 }}>{data.email}</div>
                <div style={{ color: "#666", fontSize: 14 }}>{data.phone}</div>
              </div>
            </div>

            <div style={{ lineHeight: "1.8", fontSize: 14 }}>
              <p>
                <strong>Location:</strong> {data.city}, {data.state}
              </p>
              <p>
                <strong>Bio:</strong> {data.bio || "—"}
              </p>
              <p>
                <strong>Interested in:</strong>{" "}
                {(data.serviceInterests || []).join(", ") || "—"}
              </p>
              <p>
                <strong>Contact via:</strong>{" "}
                {(data.communicationPrefs || []).join(", ") || "—"}
              </p>
              <p>
                <strong>Response time:</strong>{" "}
                {data.responseTime?.replace("-", " ") || "—"}
              </p>
              <p>
                <strong>Budget style:</strong> {data.budgetStyle || "—"}
              </p>
            </div>
          </Card>

          <div
            style={{
              marginTop: 16,
              padding: "12px",
              background: "#f0f9ff",
              borderRadius: 8,
              border: "1px solid #bae7ff",
            }}
          >
            <small style={{ color: "#1890ff" }}>
              ✅ Your profile is private. Only professionals you interact with
              will see your details.
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
            size={isMobile ? "small" : "medium"}
          />
        </div>

        {/* FORM */}
        <div style={{ flex: 1, width: "100%" }}>
          <h2 style={{ marginBottom: 8 }}>{steps[step].title}</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Step {step + 1} of {steps.length}
          </p>

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
