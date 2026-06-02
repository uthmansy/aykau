// components/jobs/manage/EditJobDrawer.tsx
"use client";

import { useEffect } from "react";
import { Drawer, Form, Input, Button, Select, Space, App } from "antd";
import { supabase } from "@/services/supabase/client";

const { TextArea } = Input;

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

  useEffect(() => {
    if (open && job) {
      form.setFieldsValue({
        description: job.description,
        budget: job.budget,
        urgency: job.urgency,
        access_notes: job.access_notes,
      });
    }
  }, [open, job, form]);

  const handleSave = async (values: any) => {
    const { data, error } = await supabase
      .from("job_requests")
      .update(values)
      .eq("id", job.id)
      .select()
      .single();

    if (error) {
      message.error("Failed to update job.");
    } else {
      message.success("Job updated successfully!");
      onUpdated(data);
      onClose();
    }
  };

  return (
    <Drawer
      title="Edit Job Details"
      size={480}
      onClose={onClose}
      open={open}
      styles={{ body: { paddingBottom: 80 } }}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()}>
            Save Changes
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, min: 20 }]}
        >
          <TextArea rows={6} />
        </Form.Item>

        <Form.Item name="budget" label="Budget" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "under-10k", label: "Under ₦10k" },
              { value: "10k-50k", label: "₦10k – ₦50k" },
              { value: "50k-100k", label: "₦50k – ₦100k" },
              { value: "100k-500k", label: "₦100k – ₦500k" },
              { value: "500k+", label: "₦500k+" },
              { value: "flexible", label: "Flexible" },
            ]}
          />
        </Form.Item>

        <Form.Item name="urgency" label="Urgency" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "asap", label: "ASAP" },
              { value: "this-week", label: "This Week" },
              { value: "this-month", label: "This Month" },
              { value: "planning", label: "Flexible" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="access_notes"
          label="Access Notes / Special Instructions"
        >
          <TextArea
            rows={3}
            placeholder="e.g. Parking is available at the back..."
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
