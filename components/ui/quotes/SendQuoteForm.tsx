"use client";

import {
  Form,
  Input,
  Button,
  Card,
  Space,
  InputNumber,
  App,
  FormInstance,
} from "antd";
import { SendOutlined } from "@ant-design/icons";
import { Dispatch, SetStateAction, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

interface Props {
  myQuote: any;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  jobId: string;
  setMyQuote: Dispatch<any>;
  form: FormInstance<any>;
}

function SendQuoteForm({
  myQuote,
  setIsEditing,
  jobId,
  setMyQuote,
  form,
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  const { message } = App.useApp();
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      message.error("You must be logged in.");
      setSubmitting(false);
      return;
    }

    const portfolioLinks = values.portfolio_links
      ? values.portfolio_links
          .split("\n")
          .map((link: string) => link.trim())
          .filter(Boolean)
      : [];

    const payload = {
      job_id: jobId,
      artisan_id: user.id,
      message: values.message,
      quoted_price: values.quoted_price,
      quoted_price_note: values.quoted_price_note,
      availability_note: values.availability_note,
      portfolio_links: portfolioLinks,
    };

    let error;
    let savedQuote;

    if (myQuote) {
      // UPDATE existing quote
      const { data, error: updateError } = await supabase
        .from("job_quotes")
        .update(payload)
        .eq("id", myQuote.id)
        .select()
        .single();

      error = updateError;
      savedQuote = data;
    } else {
      // INSERT new quote
      const { data, error: insertError } = await supabase
        .from("job_quotes")
        .insert({ ...payload, status: "pending" })
        .select()
        .single();

      error = insertError;
      savedQuote = data;
    }

    if (error) {
      console.error("Error saving quote:", error);
      message.error("Failed to save quote. Please try again.");
    } else {
      message.success(
        myQuote ? "Quote updated successfully!" : "Quote sent successfully!"
      );
      setMyQuote(savedQuote);
      setIsEditing(false); // Switch back to read-only view after saving
    }
    setSubmitting(false);
  };

  return (
    <Card
      title={
        <span className="font-semibold text-gray-900">
          {myQuote ? "Edit Your Proposal" : "Your Proposal"}
        </span>
      }
      className="rounded-xl shadow-sm border-gray-100"
      styles={{
        body: { padding: "24px" },
        header: {
          borderBottom: "1px solid #f3f4f6",
          padding: "16px 24px",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="message"
          label={
            <span className="font-medium text-gray-800">
              Cover Letter / Message
            </span>
          }
          rules={[
            { required: true, message: "Please write a message" },
            { min: 20, message: "At least 20 characters" },
          ]}
          extra="Explain why you're the best fit for this job."
        >
          <TextArea
            rows={6}
            placeholder="Hi! I saw your job post and I'd love to help..."
            showCount
            maxLength={2000}
            className="rounded-lg"
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="quoted_price"
            label={
              <span className="font-medium text-gray-800">
                Quoted Price (₦)
              </span>
            }
            className="mb-4!"
            rules={[{ type: "number", min: 0, message: "Must be positive" }]}
          >
            <InputNumber
              className="w-full rounded-lg"
              placeholder="e.g. 50000"
              formatter={(value) =>
                `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/₦\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item
            name="availability_note"
            label={
              <span className="font-medium text-gray-800">Availability</span>
            }
            className="mb-4!"
          >
            <Input
              placeholder="e.g. Available this weekend"
              className="rounded-lg"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="quoted_price_note"
          label={
            <span className="font-medium text-gray-800">
              Price Breakdown / Notes
            </span>
          }
        >
          <TextArea
            rows={3}
            placeholder="Explain what is included in your price..."
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="portfolio_links"
          label={
            <span className="font-medium text-gray-800">Portfolio Links</span>
          }
          extra="Paste links to your previous work (one per line)."
        >
          <TextArea
            rows={3}
            placeholder={
              "https://myportfolio.com\nhttps://instagram.com/mywork"
            }
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mb-0! pt-4 border-t border-gray-100">
          <Space className="w-full justify-end">
            <Button
              onClick={() => {
                if (myQuote) {
                  setIsEditing(false); // Exit edit mode
                  form.resetFields();
                } else {
                  router.back(); // Go back if creating new
                }
              }}
              className="rounded-lg"
            >
              {myQuote ? "Cancel Edit" : "Cancel"}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-sm"
            >
              {myQuote ? "Update Quote" : "Send Quote"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default SendQuoteForm;
