// components/ui/jobs/JobDetailDrawer/UnlockConsentModal.tsx
"use client";

import { Modal, Button, Divider } from "antd";
import { JobListing } from "@/lib/jobs/types";
import { SERVICE_SUBCATEGORIES } from "../../JobPostingForm";
import useJobCreditCost from "@/hooks/useJobCreditCost"; // 🟢 Import hook

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
  const subcategoryConfig = SERVICE_SUBCATEGORIES[job.category]?.find(
    (s) => s.value === job.subcategory
  );
  const jobTitle = subcategoryConfig?.label || job.subcategory;
  const creditCost = useJobCreditCost(job); // 🟢 Use hook

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      className="unlock-consent-modal"
    >
      <div className="py-6 space-y-5">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Confirm Unlock
          </h3>
          <p className="text-sm text-gray-500">
            Review the details before proceeding
          </p>
        </div>

        {/* Job Info Card */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{jobTitle}</p>
          <p className="text-sm text-gray-500">
            Unlock cost:{" "}
            <strong className="text-gray-900">{creditCost} credits</strong>
          </p>
        </div>

        {/* Balance Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
            <span className="text-gray-600">Current Balance:</span>
            <strong className="text-gray-900">{creditBalance} credits</strong>
          </div>
          <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
            <span className="text-gray-600">Unlock Cost:</span>
            <strong className="text-gray-900">-{creditCost} credits</strong>
          </div>
          <div className="flex justify-between items-center text-sm py-2 bg-green-50 rounded-lg px-3 border border-green-100">
            <span className="text-gray-700 font-medium">New Balance:</span>
            <strong className="text-green-700 text-base">
              {creditBalance - creditCost} credits
            </strong>
          </div>
        </div>

        <Divider className="!my-4" />

        {/* Benefits */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-blue-900 text-sm font-medium mb-2">
            What you get:
          </p>
          <ul className="text-blue-800 text-xs space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>View client contact details (phone & email)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Access to send a quote for this job</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>One-time payment — no recurring charges</span>
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-gray-400 text-xs text-center">
          Credits are non-refundable unless the client cancels this job.
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            block
            size="large"
            onClick={onClose}
            className="h-11 rounded-lg font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            onClick={onConfirm}
            className="bg-gray-900 hover:bg-gray-800 border-0 h-11 rounded-lg font-medium"
          >
            Confirm & Unlock
          </Button>
        </div>
      </div>
    </Modal>
  );
}
