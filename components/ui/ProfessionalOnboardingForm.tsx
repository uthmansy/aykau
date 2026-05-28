"use client";

import { useState } from "react";
import { Card, Steps, Form, Input, Button, Select, App } from "antd";
import { useOnboardingStore } from "@/store/onboarding.store";
import { Grid } from "antd";

const { useBreakpoint } = Grid;

export default function ProfessionalOnboardingForm() {
  const [form] = Form.useForm();
  const { step, setStep, updateData, data } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

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

      console.log("PROFESSIONAL PROFILE:", finalData);

      // TODO: Supabase insert here

      message.success("Profile created successfully");
    } catch {
      message.error("Please complete required fields");
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
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Profession",
      content: (
        <>
          <Form.Item
            name="profession"
            label="What do you do?"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "plumber", label: "Plumber" },
                { value: "electrician", label: "Electrician" },
                { value: "cleaner", label: "Cleaner" },
                { value: "mechanic", label: "Mechanic" },
                { value: "designer", label: "Designer" },
              ]}
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
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. 5000" />
          </Form.Item>
        </>
      ),
    },

    {
      title: "Location",
      content: (
        <Form.Item
          name="location"
          label="Where are you based?"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. Abuja, Lagos..." />
        </Form.Item>
      ),
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
        <div>
          <Card>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "40px auto",
      }}
    >
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
    </div>
  );
}
