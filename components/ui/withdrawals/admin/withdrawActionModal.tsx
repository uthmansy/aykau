// components/admin/withdrawals/WithdrawalActionModal.tsx
"use client";

import { useState } from "react";
import { Modal, Typography, Button, Input, App, Divider, Tag } from "antd";
import {
  BankOutlined,
  UserOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import dayjs from "dayjs";
import { WithdrawalRow } from "@/app/(admin)/admin/withdrawals/page";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  open: boolean;
  onClose: () => void;
  withdrawal: WithdrawalRow;
  onSuccess: () => void;
}

export default function WithdrawalActionModal({
  open,
  onClose,
  withdrawal,
  onSuccess,
}: Props) {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const handleApprove = () => {
    modal.confirm({
      title: (
        <span className="font-manrope text-primary">Approve Withdrawal?</span>
      ),
      content: (
        <div className="font-inter">
          <Text className="text-on-surface!">
            You are about to approve a withdrawal of{" "}
            <strong>₦{withdrawal.net_amount.toLocaleString()}</strong> to{" "}
            <strong>{withdrawal.bank_account?.bank_name}</strong>.
          </Text>
          <br />
          <Text className="text-on-surface-variant! text-xs! mt-2! block!">
            This will mark the request as completed and trigger the Paystack
            transfer.
          </Text>
        </div>
      ),
      okText: "Yes, Approve & Transfer",
      okButtonProps: {
        className: "bg-success! border-success! hover:bg-success/90!",
      },
      cancelButtonProps: { className: "border-outline! text-on-surface!" },
      onOk: async () => {
        setLoading(true);
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          // Call Edge Function to trigger Paystack transfer
          const { data, error } = await supabase.functions.invoke(
            "process-withdrawal",
            {
              body: {
                withdrawal_id: withdrawal.id,
                admin_id: user?.id,
              },
            }
          );

          if (error) throw error;
          if (data.error) throw new Error(data.error);

          message.success("Transfer initiated! Status updated to Processing.");
          onSuccess();
        } catch (error: any) {
          message.error(error.message || "Failed to approve withdrawal.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      message.warning("Please provide a reason for rejection.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc("reject_withdrawal", {
        p_withdrawal_id: withdrawal.id,
        p_admin_notes: adminNotes.trim(),
      });
      if (error) throw error;
      message.success("Withdrawal rejected and funds refunded.");
      onSuccess();
    } catch (error: any) {
      message.error(error.message || "Failed to reject withdrawal.");
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
      centered
      className="withdrawal-action-modal"
      styles={{
        body: {
          padding: 0,
          borderRadius: "16px",
          overflow: "hidden",
        },
        mask: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <div className="bg-surface-container-lowest p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BankOutlined className="text-primary text-xl" />
            </div>
            <div>
              <Title
                level={4}
                className="text-primary! font-manrope! font-bold! mb-1! text-lg!"
              >
                {withdrawal.reference}
              </Title>
              <Text className="text-on-surface-variant! font-inter! text-sm!">
                Requested {dayjs(withdrawal.created_at).format("MMM DD, YYYY")}
              </Text>
            </div>
          </div>
          <Tag className="rounded-full! px-3! py-1! text-xs! font-bold! uppercase! bg-[#f0ecf4]! text-[#5156a7]! border-0!">
            {withdrawal.status}
          </Tag>
        </div>

        {/* User & Bank Info Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-surface-container-low p-4 rounded-lg">
            <Text className="text-xs! font-semibold! uppercase! tracking-wider! text-on-surface-variant! block! mb-2! font-inter!">
              <UserOutlined className="mr-1" /> Requester
            </Text>
            <Text className="text-sm! font-medium! text-on-surface! block! font-inter!">
              {withdrawal.user?.full_name}
            </Text>
            <Text className="text-xs! text-on-surface-variant! font-inter!">
              {withdrawal.user?.email}
            </Text>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg">
            <Text className="text-xs! font-semibold! uppercase! tracking-wider! text-on-surface-variant! block! mb-2! font-inter!">
              <BankOutlined className="mr-1" /> Destination Bank
            </Text>
            <Text className="text-sm! font-medium! text-on-surface! block! font-inter!">
              {withdrawal.bank_account?.bank_name}
            </Text>
            <Text className="text-xs! font-mono! text-on-surface-variant!">
              {withdrawal.bank_account?.account_number}
            </Text>
            <Text className="text-xs! text-on-surface-variant! font-inter!">
              {withdrawal.bank_account?.account_name}
            </Text>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="bg-surface-container p-5 rounded-lg space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <Text className="text-sm! text-on-surface-variant! font-inter!">
              Gross Amount
            </Text>
            <Text className="text-sm! font-medium! text-on-surface! font-inter!">
              ₦{withdrawal.amount.toLocaleString()}
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text className="text-sm! text-on-surface-variant! font-inter!">
              Processing Fee (0.5%)
            </Text>
            <Text className="text-sm! font-medium! text-error! font-inter!">
              -₦{withdrawal.fee.toLocaleString()}
            </Text>
          </div>
          <Divider className="my-2! border-outline-variant/50!" />
          <div className="flex justify-between items-center">
            <Text className="text-base! font-semibold! text-on-surface! font-inter!">
              Net Payout
            </Text>
            <Text className="text-xl! font-bold! text-primary! font-manrope!">
              ₦{withdrawal.net_amount.toLocaleString()}
            </Text>
          </div>
        </div>

        {/* Rejection Notes (Only show if rejected) */}
        {withdrawal.status === "failed" && withdrawal.admin_notes && (
          <div className="bg-error/10 p-4 rounded-lg mb-6">
            <Text className="text-xs! font-semibold! text-error! block! mb-1! font-inter!">
              Admin Rejection Notes:
            </Text>
            <Text className="text-sm! text-on-surface! font-inter!">
              {withdrawal.admin_notes}
            </Text>
          </div>
        )}

        {/* Actions */}
        {withdrawal.status === "pending" && (
          <>
            <Divider className="my-4! border-outline-variant/50!" />

            <div className="space-y-4">
              <div>
                <Text className="text-sm! font-medium! text-on-surface! block! mb-2! font-inter!">
                  Reason for Rejection (Required if rejecting)
                </Text>
                <TextArea
                  rows={3}
                  placeholder="e.g., Bank account details do not match user profile..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="rounded-lg! border-outline-variant! hover:border-primary! focus:border-primary! shadow-none! font-inter!"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  block
                  size="large"
                  danger
                  loading={loading}
                  onClick={handleReject}
                  className="rounded-lg! h-11! font-inter! font-semibold! border-error! text-error! hover:bg-error/5!"
                >
                  <CloseCircleFilled className="mr-2" /> Reject Request
                </Button>
                <Button
                  block
                  size="large"
                  type="primary"
                  loading={loading}
                  onClick={handleApprove}
                  className="bg-success! border-success! text-white! font-inter! font-semibold! rounded-lg! h-11! hover:bg-success/90! shadow-[0_4px_12px_rgba(16,185,129,0.2)]!"
                >
                  <CheckCircleFilled className="mr-2" /> Approve & Transfer
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
