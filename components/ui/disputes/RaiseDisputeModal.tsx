// components/ui/disputes/RaiseDisputeModal.tsx
"use client";

import { useState } from "react";
import { Modal, Form, Input, Select, Button, App } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import EvidenceUploader from "./EvidenceUploader";

const { TextArea } = Input;
interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  conversationId: string;
  amountDisputed: number;
  onSuccess: () => void;
}
const DISPUTE_REASONS = [
  { value: "work_not_completed", label: "Work not completed as agreed" },
  { value: "poor_quality", label: "Poor quality of work" },
  { value: "missed_deadline", label: "Missed deadline" },
  { value: "unresponsive", label: "Artisan/Customer unresponsive" },
  { value: "miscommunication", label: "Miscommunication about scope" },
  { value: "payment_issue", label: "Payment issue" },
  { value: "other", label: "Other" },
];
interface UploadedFile {
  url: string;
  type: "photo" | "document";
}

export default function RaiseDisputeModal({
  open,
  onClose,
  contractId,
  conversationId,
  amountDisputed,
  onSuccess,
}: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const handleUploadComplete = (url: string, fileType: "photo" | "document") =>
    setUploadedFiles((prev) => [...prev, { url, type: fileType }]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not authenticated");
      const { data: disputeId, error: disputeError } = await supabase.rpc(
        "raise_dispute",
        {
          p_contract_id: contractId,
          p_conversation_id: conversationId,
          p_reason: values.reason,
          p_description: values.description,
        }
      );
      if (disputeError) throw disputeError;
      if (uploadedFiles.length > 0 && disputeId) {
        await supabase.from("dispute_evidence").insert(
          uploadedFiles.map((file) => ({
            dispute_id: disputeId,
            submitted_by: userId,
            evidence_type: file.type,
            url: file.url,
            description: "Initial evidence submitted with dispute",
          }))
        );
      }
      message.success(
        "Dispute raised successfully. Escrow funds are now frozen."
      );
      onSuccess();
      onClose();
      form.resetFields();
      setUploadedFiles([]);
    } catch (error: any) {
      if (error.message.includes("no_funded_escrow"))
        message.error("Cannot dispute: No funds in escrow.");
      else if (error.message.includes("already_disputed"))
        message.error("This contract is already in dispute.");
      else message.error(error.message || "Failed to raise dispute.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
      styles={{
        body: {
          padding: "32px",
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
        },
      }}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
            <WarningOutlined className="text-error text-xl" />
          </div>
          <div>
            <h3 className="font-manrope text-[24px] font-semibold text-primary">
              Raise Dispute
            </h3>
            <p className="font-inter text-[14px] text-on-surface-variant">
              Freeze escrow funds and request admin mediation.
            </p>
          </div>
        </div>
        <div className="bg-error/5 border border-error/20 rounded-2xl p-5">
          <p className="font-inter text-[14px] font-semibold text-error mb-2">
            Before you proceed:
          </p>
          <ul className="font-inter text-[14px] text-on-surface-variant space-y-1.5 list-disc list-inside">
            <li>Escrow funds will be frozen immediately</li>
            <li>Both parties have 48 hours to resolve via mediation</li>
            <li>
              If unresolved, an admin will review and make a final decision
            </li>
            <li>You can withdraw the dispute anytime before admin reviews</li>
          </ul>
        </div>
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
          <span className="font-inter text-[12px] text-on-surface-variant block">
            Amount in Dispute
          </span>
          <div className="font-manrope text-[24px] font-semibold text-primary mt-1">
            ₦{amountDisputed.toLocaleString()}
          </div>
          <span className="font-inter text-[12px] text-outline mt-1 block">
            This is the current escrow balance that will be frozen
          </span>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="space-y-2"
        >
          <Form.Item
            name="reason"
            label={
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Reason for Dispute
              </span>
            }
            rules={[{ required: true, message: "Please select a reason" }]}
          >
            <Select
              placeholder="Select the primary reason"
              options={DISPUTE_REASONS}
              size="large"
              className="w-full! [&_.ant-select-selector]:bg-surface-container! [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:rounded-lg! [&_.ant-select-selector]:h-12! [&_.ant-select-selector]:font-inter! [&_.ant-select-selector]:text-[14px]!"
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Detailed Description
              </span>
            }
            rules={[
              { required: true, message: "Please provide a description" },
              { min: 50, message: "At least 50 characters" },
            ]}
            extra={
              <span className="font-inter text-[12px] text-outline mt-1 block">
                Explain what went wrong and what resolution you're seeking
              </span>
            }
          >
            <TextArea
              rows={5}
              placeholder="Please provide a detailed explanation..."
              maxLength={1000}
              showCount
              className="w-full! bg-surface-container! border-none! rounded-lg! py-3! px-4! font-inter! text-[14px]! resize-none! focus:ring-1! focus:ring-primary/30!"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Supporting Evidence (Optional)
              </span>
            }
          >
            <EvidenceUploader
              contractId={contractId}
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
            />
            {uploadedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedFiles.map((file, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${file.type === "photo" ? "bg-primary/10 text-primary" : "bg-error/10 text-error"}`}
                  >
                    {file.type === "photo" ? "📷" : "📄"} File {idx + 1}
                  </span>
                ))}
              </div>
            )}
            <span className="font-inter text-[12px] text-outline mt-2 block">
              Upload photos or documents that support your claim
            </span>
          </Form.Item>
          <div className="h-px bg-outline-variant/30 my-6" />
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              size="large"
              className="flex-1! rounded-lg! h-auto! py-3! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              size="large"
              loading={loading}
              className="flex-1! rounded-lg! h-auto! py-3! bg-error! hover:bg-error/90! border-none! text-on-error! font-inter! text-[14px]! font-medium!"
            >
              Raise Dispute
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
