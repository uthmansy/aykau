// components/ui/chat/RequestPaymentModal.tsx
"use client";

import { useState } from "react";
import { Modal, InputNumber, Input, Button, App, Typography } from "antd";
import { supabase } from "@/services/supabase/client";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  maxAmount: number; // The total agreed amount or remaining escrow
  onRequestSuccess: () => void;
}

export default function RequestPaymentModal({
  open,
  onClose,
  contractId,
  maxAmount,
  onRequestSuccess,
}: Props) {
  const { message } = App.useApp();
  const [amount, setAmount] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [requestType, setRequestType] = useState<
    "fund_escrow" | "release_escrow"
  >("fund_escrow");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      message.warning("Please enter a valid amount.");
      return;
    }
    if (!description.trim()) {
      message.warning("Please provide a brief description for this request.");
      return;
    }

    setLoading(true);
    try {
      // 🟢 Call the secure RPC instead of direct insert
      const { error } = await supabase.rpc("create_payment_request", {
        p_contract_id: contractId,
        p_amount: amount,
        p_description: description.trim(),
        p_request_type: requestType,
      });

      if (error) throw error;

      message.success("Payment request sent successfully!");
      onRequestSuccess();
      onClose();
      setAmount(null);
      setDescription("");
    } catch (error: any) {
      console.error("Request error:", error);
      // Handle specific validation errors from the RPC
      if (error.message.includes("invalid_amount")) {
        message.error("The requested amount exceeds the available limit.");
      } else if (error.message.includes("unauthorized")) {
        message.error(
          "You do not have permission to request payment for this contract."
        );
      } else {
        message.error("Failed to send request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Request Payment"
      footer={null}
      destroyOnHidden
      width={480}
    >
      <div className="py-4 space-y-5">
        {/* Request Type Selection */}
        <div>
          <Text strong className="block text-sm text-gray-700 mb-2">
            Request Type
          </Text>
          <div className="flex gap-3">
            <Button
              className={`flex-1 !h-10 !rounded-lg !font-medium ${
                requestType === "fund_escrow"
                  ? "!bg-gray-900 !text-white !border-gray-900"
                  : "!bg-white !text-gray-600 !border-gray-300 hover:!border-gray-400"
              }`}
              onClick={() => setRequestType("fund_escrow")}
            >
              Fund Escrow
            </Button>
            <Button
              className={`flex-1 !h-10 !rounded-lg !font-medium ${
                requestType === "release_escrow"
                  ? "!bg-gray-900 !text-white !border-gray-900"
                  : "!bg-white !text-gray-600 !border-gray-300 hover:!border-gray-400"
              }`}
              onClick={() => setRequestType("release_escrow")}
            >
              Release Escrow
            </Button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <Text strong className="block text-sm text-gray-700 mb-2">
            Amount Requested
          </Text>
          <InputNumber
            size="large"
            className="!w-full !h-12 !rounded-lg !text-lg"
            placeholder="e.g. 50000"
            min={100}
            max={maxAmount}
            value={amount}
            onChange={(val) => setAmount(val)}
            prefix="₦"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value!.replace(/\₦\s?|(,*)/g, "") as any}
          />
          <Text className="!text-gray-400 !text-xs block mt-1.5">
            Maximum available: ₦{Number(maxAmount).toLocaleString()}
          </Text>
        </div>

        {/* Description Input */}
        <div>
          <Text strong className="block text-sm text-gray-700 mb-2">
            Description
          </Text>
          <Input.TextArea
            rows={3}
            placeholder="e.g., 50% upfront for materials and initial labor"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="!rounded-lg !border-gray-300 focus:!border-gray-500"
            maxLength={200}
            showCount
          />
        </div>

        {/* Submit Button */}
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleSubmit}
          className="!h-12 !rounded-lg !bg-gray-900 hover:!bg-gray-800 !border-0 !font-medium !mt-2"
        >
          Send Request
        </Button>
      </div>
    </Modal>
  );
}
