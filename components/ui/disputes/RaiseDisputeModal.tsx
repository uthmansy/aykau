// components/ui/disputes/RaiseDisputeModal.tsx
"use client";

import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  App,
  Typography,
  Divider,
  Tag,
} from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import EvidenceUploader from "./EvidenceUploader";

const { Text, Title } = Typography;
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

// 🟢 NEW: Type for our uploaded files to track both URL and type
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

  // 🟢 UPDATED: State now holds objects with url and type
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // 🟢 UPDATED: Handler matches the new EvidenceUploader signature
  const handleUploadComplete = (
    url: string,
    fileType: "photo" | "document"
  ) => {
    setUploadedFiles((prev) => [...prev, { url, type: fileType }]);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not authenticated");

      // 1. Raise the dispute via RPC
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

      // 2. Save the uploaded files as dispute evidence
      if (uploadedFiles.length > 0 && disputeId) {
        const evidenceRecords = uploadedFiles.map((file) => ({
          dispute_id: disputeId,
          submitted_by: userId,
          evidence_type: file.type, // 🟢 Uses the correct type from the uploader
          url: file.url,
          description: "Initial evidence submitted with dispute",
        }));

        const { error: evidenceError } = await supabase
          .from("dispute_evidence")
          .insert(evidenceRecords);

        if (evidenceError) {
          console.error("Failed to save evidence records:", evidenceError);
          // We don't throw here to avoid failing the whole dispute if evidence save fails,
          // but we log it. The dispute is already raised.
        }
      }

      message.success(
        "Dispute raised successfully. Escrow funds are now frozen."
      );
      onSuccess();
      onClose();
      form.resetFields();
      setUploadedFiles([]);
    } catch (error: any) {
      console.error("Dispute error:", error);
      if (error.message.includes("no_funded_escrow")) {
        message.error("Cannot dispute: No funds in escrow.");
      } else if (error.message.includes("already_disputed")) {
        message.error("This contract is already in dispute.");
      } else if (error.message.includes("unauthorized")) {
        message.error(
          "You are not authorized to raise a dispute for this contract."
        );
      } else {
        message.error(
          error.message || "Failed to raise dispute. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2">
          <WarningOutlined className="text-orange-500" />
          <span>Raise Dispute</span>
        </div>
      }
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="py-4">
        {/* Warning Box */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <WarningOutlined className="text-orange-500 text-xl mt-0.5 flex-shrink-0" />
            <div>
              <Text strong className="text-orange-900 block mb-1">
                Before you proceed:
              </Text>
              <ul className="text-orange-800 text-sm space-y-1 list-disc list-inside">
                <li>Escrow funds will be frozen immediately</li>
                <li>Both parties have 48 hours to resolve via mediation</li>
                <li>
                  If unresolved, an admin will review and make a final decision
                </li>
                <li>
                  You can withdraw the dispute anytime before admin reviews
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Amount Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <Text className="text-gray-600 text-sm">Amount in Dispute</Text>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            ₦{amountDisputed.toLocaleString()}
          </div>
          <Text className="text-gray-500 text-xs mt-1 block">
            This is the current escrow balance that will be frozen
          </Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="reason"
            label="Reason for Dispute"
            rules={[{ required: true, message: "Please select a reason" }]}
          >
            <Select
              placeholder="Select the primary reason"
              options={DISPUTE_REASONS}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Detailed Description"
            rules={[
              { required: true, message: "Please provide a description" },
              { min: 50, message: "Please provide at least 50 characters" },
            ]}
            extra="Explain what went wrong and what resolution you're seeking"
          >
            <TextArea
              rows={5}
              placeholder="Please provide a detailed explanation of the issue..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item label="Supporting Evidence (Optional)">
            <EvidenceUploader
              contractId={contractId}
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
            />

            {/* 🟢 Show uploaded files as tags */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedFiles.map((file, idx) => (
                  <Tag
                    key={idx}
                    color={file.type === "photo" ? "blue" : "red"}
                    className="flex items-center gap-1"
                  >
                    {file.type === "photo" ? "📷" : "📄"} File {idx + 1}
                  </Tag>
                ))}
              </div>
            )}

            <Text className="text-gray-500 text-xs mt-2 block">
              Upload photos or documents that support your claim
            </Text>
          </Form.Item>

          <Divider className="!my-4" />

          <div className="flex gap-3">
            <Button onClick={onClose} size="large" className="flex-1">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              danger
              className="flex-1"
            >
              Raise Dispute
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
