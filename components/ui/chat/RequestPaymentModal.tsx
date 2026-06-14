// components/ui/chat/RequestPaymentModal.tsx
"use client";

import { useState } from "react";
import { Modal, InputNumber, Input, Button, App } from "antd";
import { supabase } from "@/services/supabase/client";

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  maxAmount: number;
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
    if (!amount || amount <= 0)
      return message.warning("Please enter a valid amount.");
    if (!description.trim())
      return message.warning("Please provide a brief description.");
    setLoading(true);
    try {
      const { error } = await supabase.rpc("create_payment_request", {
        p_contract_id: contractId,
        p_amount: amount,
        p_description: description.trim(),
        p_request_type: requestType,
      });
      if (error) throw error;
      message.success("Payment request sent!");
      onRequestSuccess();
      onClose();
      setAmount(null);
      setDescription("");
    } catch (error: any) {
      if (error.message.includes("invalid_amount"))
        message.error("Amount exceeds available limit.");
      else if (error.message.includes("unauthorized"))
        message.error("Unauthorized to request payment.");
      else message.error("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={480}
      styles={{
        body: {
          padding: "32px",
          borderRadius: "16px",
          backgroundColor: "var(--surface-container-lowest)",
        },
      }}
    >
      <div className="space-y-6">
        <div>
          <h3 className="font-manrope text-[24px] font-semibold text-primary mb-1">
            Request Payment
          </h3>
          <p className="font-inter text-[14px] text-on-surface-variant">
            Request funds from escrow or customer.
          </p>
        </div>
        <div>
          <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-3">
            Request Type
          </span>
          <div className="flex gap-3">
            {["fund_escrow", "release_escrow"].map((type) => (
              <button
                key={type}
                onClick={() => setRequestType(type as any)}
                className={`flex-1 h-10 rounded-lg font-inter text-[14px] font-medium transition-all border ${requestType === type ? "bg-primary/5 border-primary text-primary" : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-primary/40"}`}
              >
                {type === "fund_escrow" ? "Fund Escrow" : "Release Escrow"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-2">
            Amount Requested
          </span>
          <InputNumber
            size="large"
            className="w-full! h-12! rounded-lg! bg-surface-container! border-none! font-inter! text-[16px]! focus:ring-1! focus:ring-primary/30!"
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
          <span className="font-inter text-[12px] text-outline block mt-1.5">
            Maximum available: ₦{Number(maxAmount).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-2">
            Description
          </span>
          <Input.TextArea
            rows={3}
            placeholder="e.g., 50% upfront for materials..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full! bg-surface-container! border-none! rounded-lg! py-3! px-4! font-inter! text-[14px]! focus:ring-1! focus:ring-primary/30! resize-none!"
            maxLength={200}
            showCount
          />
        </div>
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleSubmit}
          className="!rounded-lg! !h-auto! !py-3! !bg-secondary! hover:!bg-secondary/90! !border-none! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
        >
          Send Request
        </Button>
      </div>
    </Modal>
  );
}
