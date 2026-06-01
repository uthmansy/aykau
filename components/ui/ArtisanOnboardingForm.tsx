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
} from "antd";
import { useArtisanOnboardingStore } from "@/store/artisanOnboarding.store";
import { Grid } from "antd";
import { getLgasByState } from "@/lib/helpers/location";
import LocationSelect from "./jobs/LocationSelect";

const { useBreakpoint } = Grid;

export default function ArtisanOnboardingForm() {
  const [form] = Form.useForm();
  const stateCode = Form.useWatch("state", form);
  const lgas = stateCode ? getLgasByState(stateCode) : [];
  const { step, setStep, updateData, data } = useArtisanOnboardingStore();
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
          <Form.Item name="nin" label="NIN Number" rules={[{ required: true }]}>
            <Input />
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
      content: <LocationSelect updateData={updateData} />,
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
