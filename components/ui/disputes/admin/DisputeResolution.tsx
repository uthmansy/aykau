"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Form, Select, InputNumber, Button, App, Spin } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import DisputeThread from "../DisputeThread";
import EvidenceGallery from "../EvidenceGallery";
import dayjs from "dayjs";

const { TextArea } = Input;

// Define types for better type safety
type DisputeStatus =
  | "mediation"
  | "under_review"
  | "resolved"
  | "withdrawn"
  | string;

interface DisputeData {
  id: string;
  status: DisputeStatus;
  created_at: string;
  amount_disputed: number;
  description: string;
  outcome?: string;
  split_percentage?: number;
  resolution_notes?: string;
  job?: { title: string; description: string };
  raiser?: { full_name: string; email: string };
  against_user?: { full_name: string; email: string };
}

interface Props {
  disputeId: string;
}

export default function DisputeResolution({ disputeId }: Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [dispute, setDispute] = useState<DisputeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [activeTab, setActiveTab] = useState<"evidence" | "thread">("evidence");

  const splitPercentage = Form.useWatch("split_percentage", form) || 0;

  useEffect(() => {
    fetchData();
  }, [disputeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: disputeData, error: dError } = await supabase
        .from("disputes")
        .select(
          `*, job:job_requests(title, description), raiser:raised_by(full_name, email), against_user:against(full_name, email)`
        )
        .eq("id", disputeId)
        .single();

      if (dError) throw dError;
      setDispute(disputeData as DisputeData);
    } catch (error) {
      console.error("Error fetching dispute details:", error);
      message.error("Failed to load dispute details.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (values: any) => {
    setResolving(true);
    try {
      const { error } = await supabase.rpc("resolve_dispute", {
        p_dispute_id: disputeId,
        p_outcome: values.outcome,
        p_split_percentage:
          values.outcome === "split" ? values.split_percentage : null,
        p_resolution_notes: values.resolution_notes,
      });

      if (error) throw error;
      message.success(
        "Dispute resolved successfully! Funds have been distributed."
      );
      router.push("/admin/disputes");
    } catch (error: any) {
      console.error("Resolve error:", error);
      message.error(error.message || "Failed to resolve dispute.");
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex items-center justify-center min-h-[50vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="font-manrope text-[24px] font-semibold text-primary mb-2">
          Dispute Not Found
        </h2>
        <Button
          onClick={() => router.push("/admin/disputes")}
          className="mt-4 rounded-lg! bg-secondary! border-none! text-on-secondary!"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isResolved =
    dispute.status === "resolved" || dispute.status === "withdrawn";
  const artisanShare = dispute.amount_disputed * (splitPercentage / 100);
  const customerShare = dispute.amount_disputed - artisanShare;

  // Define status styles with explicit typing
  const statusStyles: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    mediation: {
      bg: "bg-warning/10",
      text: "text-warning",
      label: "In Mediation",
    },
    under_review: {
      bg: "bg-error/10",
      text: "text-error",
      label: "Under Review",
    },
    resolved: {
      bg: "bg-success-emerald/10",
      text: "text-success-emerald",
      label: "Resolved",
    },
    withdrawn: {
      bg: "bg-on-surface-variant/10",
      text: "text-on-surface-variant",
      label: "Withdrawn",
    },
  };

  // Safely access status styles
  const currentStatusStyle = statusStyles[dispute.status] || {
    bg: "bg-on-surface-variant/10",
    text: "text-on-surface-variant",
    label: dispute.status,
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="rounded-lg! h-auto! py-2! px-4! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-manrope text-[24px] md:text-[32px] font-semibold text-primary leading-tight">
              Dispute #{dispute.id.slice(0, 8)}
            </h1>
            <span
              className={`px-2.5 py-1 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider ${currentStatusStyle.bg} ${currentStatusStyle.text}`}
            >
              {currentStatusStyle.label}
            </span>
          </div>
          <p className="font-inter text-[14px] text-on-surface-variant mt-1">
            Raised on {dayjs(dispute.created_at).format("MMM D, YYYY")}
          </p>
        </div>
      </div>

      {/* Resolved Alert */}
      {isResolved && (
        <div
          className={`rounded-2xl p-5 border flex items-start gap-4 ${dispute.status === "resolved" ? "bg-success-emerald/5 border-success-emerald/20" : "bg-primary/5 border-primary/10"}`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-none ${dispute.status === "resolved" ? "bg-success-emerald/10" : "bg-primary/10"}`}
          >
            <CheckCircleOutlined
              className={`text-[18px] ${dispute.status === "resolved" ? "text-success-emerald" : "text-primary"}`}
            />
          </div>
          <div>
            <h4
              className={`font-inter text-[14px] font-semibold mb-1 ${dispute.status === "resolved" ? "text-success-emerald" : "text-primary"}`}
            >
              Dispute {dispute.status === "resolved" ? "Resolved" : "Withdrawn"}
            </h4>
            <p className="font-inter text-[14px] text-on-surface-variant">
              {dispute.resolution_notes || "No resolution notes provided."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Context & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Context Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 space-y-6">
            <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Job Context
            </h3>

            <div>
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                Job Title
              </span>
              <p className="font-inter text-[16px] font-medium text-on-surface">
                {dispute.job?.title || "Unknown Job"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20">
                <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-2">
                  Raiser
                </span>
                <p className="font-inter text-[16px] font-medium text-on-surface">
                  {dispute.raiser?.full_name || "Unknown"}
                </p>
                <p className="font-inter text-[14px] text-on-surface-variant mt-0.5">
                  {dispute.raiser?.email}
                </p>
              </div>
              <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20">
                <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-2">
                  Against
                </span>
                <p className="font-inter text-[16px] font-medium text-on-surface">
                  {dispute.against_user?.full_name || "Unknown"}
                </p>
                <p className="font-inter text-[14px] text-on-surface-variant mt-0.5">
                  {dispute.against_user?.email}
                </p>
              </div>
            </div>

            <div className="h-px bg-outline-variant/30" />

            <div>
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                Reason for Dispute
              </span>
              <p className="font-inter text-[16px] text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {dispute.description}
              </p>
            </div>
          </div>

          {/* Tabs Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/30 flex gap-2">
              <Button
                type={activeTab === "evidence" ? "primary" : "default"}
                onClick={() => setActiveTab("evidence")}
                className={`rounded-lg! h-auto! py-2! px-5! font-inter! text-[14px]! font-medium! transition-all ${
                  activeTab === "evidence"
                    ? "bg-primary! hover:bg-primary/90! border-none! text-on-primary!"
                    : "bg-surface-container! hover:bg-surface-container-high! border-outline-variant! text-on-surface-variant!"
                }`}
              >
                Evidence
              </Button>
              <Button
                type={activeTab === "thread" ? "primary" : "default"}
                onClick={() => setActiveTab("thread")}
                className={`rounded-lg! h-auto! py-2! px-5! font-inter! text-[14px]! font-medium! transition-all ${
                  activeTab === "thread"
                    ? "bg-primary! hover:bg-primary/90! border-none! text-on-primary!"
                    : "bg-surface-container! hover:bg-surface-container-high! border-outline-variant! text-on-surface-variant!"
                }`}
              >
                Discussion Thread
              </Button>
            </div>
            <div className="p-6">
              {activeTab === "evidence" ? (
                <EvidenceGallery disputeId={disputeId} />
              ) : (
                <DisputeThread disputeId={disputeId} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Resolution Form */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 sticky top-24">
            <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-6">
              Admin Resolution
            </h3>

            {isResolved ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-success-emerald/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircleOutlined className="text-success-emerald text-3xl" />
                </div>
                <h4 className="font-manrope text-[20px] font-semibold text-primary mb-2">
                  Dispute Resolved
                </h4>
                <p className="font-inter text-[14px] text-on-surface-variant mb-1">
                  Outcome:{" "}
                  <span className="font-semibold text-on-surface">
                    {dispute.outcome?.replace("_", " ").toUpperCase()}
                  </span>
                </p>
                {dispute.outcome === "split" && (
                  <p className="font-inter text-[12px] text-on-surface-variant mt-2">
                    Split: {dispute.split_percentage}% to Artisan
                  </p>
                )}
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleResolve}
                requiredMark={false}
                className="space-y-2"
              >
                {/* Escrow Amount */}
                <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20 mb-6">
                  <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1">
                    Amount in Escrow
                  </span>
                  <div className="font-manrope text-[24px] font-semibold text-primary">
                    ₦{Number(dispute.amount_disputed).toLocaleString()}
                  </div>
                </div>

                {/* Outcome */}
                <Form.Item
                  name="outcome"
                  label={
                    <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                      Resolution Outcome
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select an outcome" },
                  ]}
                  className="mb-4!"
                >
                  <Select
                    placeholder="Choose how to distribute funds"
                    options={[
                      {
                        value: "full_refund",
                        label: "Full Refund to Customer",
                      },
                      {
                        value: "full_release",
                        label: "Full Release to Artisan",
                      },
                      { value: "split", label: "Split Funds" },
                    ]}
                    onChange={(value) => {
                      if (value !== "split")
                        form.setFieldValue("split_percentage", undefined);
                    }}
                    className="w-full! [&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-10! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[14px]!"
                  />
                </Form.Item>

                {/* Split Details */}
                {form.getFieldValue("outcome") === "split" && (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 mb-6 space-y-4">
                    <Form.Item
                      name="split_percentage"
                      label={
                        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                          Artisan's Share (%)
                        </span>
                      }
                      rules={[
                        { required: true, message: "Required for split" },
                      ]}
                      className="mb-2!"
                    >
                      <InputNumber<number>
                        min={0}
                        max={100}
                        formatter={(value: number | undefined) => `${value}%`}
                        parser={(value: string | undefined) =>
                          (value ? Number(value.replace("%", "")) : 0) as any
                        }
                        className="w-full! bg-surface-container-lowest! border-none! rounded-lg! h-10! px-3! font-inter! text-[14px]! focus:ring-1! focus:ring-primary/30!"
                      />
                    </Form.Item>
                    <div className="space-y-2 font-inter text-[14px]">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">
                          Artisan receives:
                        </span>
                        <span className="font-semibold text-on-surface">
                          ₦{Number(artisanShare).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">
                          Customer refund:
                        </span>
                        <span className="font-semibold text-on-surface">
                          ₦{Number(customerShare).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <Form.Item
                  name="resolution_notes"
                  label={
                    <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                      Resolution Notes
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please explain your decision" },
                  ]}
                  extra={
                    <span className="font-inter text-[12px] text-outline mt-1 block">
                      This will be visible to both parties.
                    </span>
                  }
                  className="mb-6!"
                >
                  <TextArea
                    rows={4}
                    placeholder="Explain the reasoning behind this decision..."
                    maxLength={500}
                    showCount
                    className="w-full! bg-surface-container! border-none! rounded-lg! py-3! px-4! font-inter! text-[14px]! resize-none! focus:ring-1! focus:ring-primary/30!"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={resolving}
                  // ✅ Destructive Action: Uses Error Red to signify finality
                  className="rounded-lg! h-auto! py-3.5! bg-error! hover:bg-error/90! border-none! text-on-error! font-inter! text-[16px]! font-medium! shadow-lg! shadow-error/20!"
                >
                  Confirm & Resolve Dispute
                </Button>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
