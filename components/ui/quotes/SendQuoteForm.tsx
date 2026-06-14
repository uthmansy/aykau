"use client";

import { Form, Input, Button, InputNumber, App, FormInstance } from "antd";
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

export default function SendQuoteForm({
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
          .map((l: string) => l.trim())
          .filter(Boolean)
      : [];

    let error, savedQuote;

    if (myQuote) {
      const payload = {
        message: values.message,
        quoted_price: values.quoted_price,
        quoted_price_note: values.quoted_price_note,
        availability_note: values.availability_note,
        portfolio_links: portfolioLinks,
      };
      const { data, error: updateError } = await supabase
        .from("job_quotes")
        .update(payload)
        .eq("id", myQuote.id)
        .select()
        .single();
      error = updateError;
      savedQuote = data;
    } else {
      try {
        const { data, error: rpcError } = await supabase.rpc("submit_quote", {
          p_job_id: jobId,
          p_quoted_price: values.quoted_price,
          p_quoted_price_note: values.quoted_price_note || null,
          p_message: values.message,
          p_availability_note: values.availability_note || null,
          p_portfolio_links: portfolioLinks,
        });
        error = rpcError;
        if (!rpcError) {
          const { data: quoteData } = await supabase
            .from("job_quotes")
            .select("*")
            .eq("job_id", jobId)
            .eq("artisan_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          savedQuote = quoteData;
        }
      } catch (err: any) {
        error = err;
      }
    }

    if (error) {
      if (error.message?.includes("job_not_available"))
        message.error("This job is no longer accepting quotes.");
      else if (error.message?.includes("job_not_unlocked")) {
        message.error("You must unlock this job first.");
        router.push(`/dashboard/jobs/${jobId}`);
      } else if (error.message?.includes("quote_already_exists"))
        message.error("You have already sent a quote for this job.");
      else if (error.message?.includes("cannot_quote_own_job"))
        message.error("You cannot quote on your own job.");
      else message.error("Failed to save quote. Please try again.");
    } else {
      message.success(
        myQuote ? "Quote updated successfully!" : "Quote sent successfully!"
      );
      setMyQuote(savedQuote);
      setIsEditing(false);
    }
    setSubmitting(false);
  };

  // ✅ Shared classes for standard inputs to ensure perfect alignment
  const inputClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! h-12! px-4! font-inter! text-[16px]! focus:ring-1! focus:ring-primary/30!";

  // ✅ Shared classes for text areas (keeps py-3! because they grow based on rows)
  const textAreaClasses =
    "w-full! bg-surface-container! border-none! rounded-lg! py-3! px-4! font-inter! text-[16px]! focus:ring-1! focus:ring-primary/30!";

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 md:p-8">
      <h3 className="font-manrope text-[24px] font-semibold text-primary mb-6">
        {myQuote ? "Edit Your Proposal" : "Your Proposal"}
      </h3>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
        className="space-y-6"
      >
        <Form.Item
          name="message"
          label={
            <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Cover Letter / Message
            </span>
          }
          rules={[
            { required: true, message: "Please write a message" },
            { min: 20, message: "At least 20 characters" },
          ]}
          extra={
            <span className="font-inter text-[12px] text-outline mt-1 block">
              Explain why you're the best fit for this job.
            </span>
          }
        >
          <TextArea
            rows={6}
            placeholder="Hi! I saw your job post and I'd love to help..."
            showCount
            maxLength={2000}
            className={textAreaClasses}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="quoted_price"
            label={
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Quoted Price (₦)
              </span>
            }
            className="mb-0!"
            rules={[{ type: "number", min: 0, message: "Must be positive" }]}
          >
            <InputNumber
              placeholder="e.g. 50000"
              formatter={(value) =>
                `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/₦\s?|(,*)/g, "") as any}
              // ✅ Changed py-3! to h-12! (48px fixed height) to perfectly match the Input
              className={inputClasses}
            />
          </Form.Item>
          <Form.Item
            name="availability_note"
            label={
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Availability
              </span>
            }
            className="mb-0!"
          >
            <Input
              placeholder="e.g. Available this weekend"
              // ✅ Changed py-3! to h-12! (48px fixed height)
              className={inputClasses}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="quoted_price_note"
          label={
            <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Price Breakdown / Notes
            </span>
          }
        >
          <TextArea
            rows={3}
            placeholder="Explain what is included in your price..."
            className={textAreaClasses}
          />
        </Form.Item>

        <Form.Item
          name="portfolio_links"
          label={
            <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Portfolio Links
            </span>
          }
          extra={
            <span className="font-inter text-[12px] text-outline mt-1 block">
              Paste links to your previous work (one per line).
            </span>
          }
        >
          <TextArea
            rows={3}
            placeholder={
              "https://myportfolio.com\nhttps://instagram.com/mywork"
            }
            className={textAreaClasses}
          />
        </Form.Item>

        <div className="h-px bg-outline-variant/30 my-8" />

        <Form.Item className="mb-0! flex flex-col sm:flex-row justify-end gap-3">
          <Button
            onClick={() => {
              if (myQuote) {
                setIsEditing(false);
                form.resetFields();
              } else {
                router.back();
              }
            }}
            className="rounded-lg! h-auto! py-3! px-6! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
          >
            {myQuote ? "Cancel Edit" : "Cancel"}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={submitting}
            className="rounded-lg! h-auto! py-3! px-8! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
          >
            {myQuote ? "Update Quote" : "Send Quote"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
