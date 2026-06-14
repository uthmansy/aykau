"use client";

import { Modal, Button } from "antd";
import { JobListing } from "@/lib/jobs/types";
import useJobCreditCost from "@/hooks/useJobCreditCost";
import { CheckCircleFilled, LockOutlined } from "@ant-design/icons";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  job: JobListing;
  creditBalance: number;
  loading: boolean;
}

export default function UnlockConsentModal({
  open,
  onClose,
  onConfirm,
  job,
  creditBalance,
  loading,
}: Props) {
  const creditCost = useJobCreditCost(job);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      styles={{
        body: {
          borderRadius: "16px",
          padding: "32px",
          backgroundColor: "var(--surface-container-lowest)",
          border: "1px solid var(--outline-variant)",
        },
      }}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
            <LockOutlined className="text-primary text-xl" />
          </div>
          <div>
            <h3 className="font-manrope text-[24px] font-semibold text-primary">
              Confirm Unlock
            </h3>
            <p className="font-inter text-[14px] text-on-surface-variant">
              Review the details before proceeding
            </p>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
          <p className="font-inter text-[16px] font-medium text-on-surface mb-1 truncate">
            {job.title || job.subcategory}
          </p>
          <p className="font-inter text-[14px] text-on-surface-variant">
            Unlock cost:{" "}
            <strong className="text-primary">{creditCost} credits</strong>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center font-inter text-[14px] py-3 border-b border-outline-variant/30">
            <span className="text-on-surface-variant">Current Balance:</span>
            <strong className="text-on-surface">{creditBalance} credits</strong>
          </div>
          <div className="flex justify-between items-center font-inter text-[14px] py-3 border-b border-outline-variant/30">
            <span className="text-on-surface-variant">Unlock Cost:</span>
            <strong className="text-on-surface">-{creditCost} credits</strong>
          </div>
          <div className="flex justify-between items-center font-inter text-[14px] py-4 bg-success-emerald/5 rounded-2xl px-5 border border-success-emerald/20">
            <span className="text-on-surface font-medium">New Balance:</span>
            <strong className="text-success-emerald text-[16px]">
              {creditBalance - creditCost} credits
            </strong>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
          <p className="font-inter text-[14px] font-semibold text-primary mb-3">
            What you get:
          </p>
          <ul className="space-y-2">
            {[
              "View client contact details (phone & email)",
              "Access to send a quote for this job",
              "One-time payment — no recurring charges",
            ].map((benefit, i) => (
              <li
                key={i}
                className="flex items-start gap-2 font-inter text-[14px] text-on-surface-variant"
              >
                <CheckCircleFilled className="text-success-emerald mt-0.5 text-[14px]" />{" "}
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-inter text-[12px] text-outline text-center">
          Credits are non-refundable unless the client cancels this job.
        </p>

        <div className="flex gap-4 pt-2">
          <Button
            block
            size="large"
            onClick={onClose}
            className="rounded-lg! h-auto! py-3! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            onClick={onConfirm}
            className="rounded-lg! h-auto! py-3! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
          >
            Confirm & Unlock
          </Button>
        </div>
      </div>
    </Modal>
  );
}
