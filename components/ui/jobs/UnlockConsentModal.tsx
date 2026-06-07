// components/jobs/UnlockConsentModal.tsx
import { Modal, Typography, Button, Divider } from "antd";

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  creditCost: number;
  currentBalance: number;
  loading?: boolean;
}

export default function UnlockConsentModal({
  open,
  onClose,
  onConfirm,
  jobTitle,
  creditCost,
  currentBalance,
  loading,
}: Props) {
  return (
    <Modal
      title="Confirm Unlock"
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
    >
      <div className="py-4 space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Text strong className="!text-gray-900 block mb-1">
            {jobTitle}
          </Text>
          <Text className="!text-gray-500 !text-sm">
            Unlock cost:{" "}
            <strong className="!text-gray-900">{creditCost} credits</strong>
          </Text>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <Text className="!text-gray-600">Current Balance:</Text>
            <Text strong className="!text-gray-900">
              {currentBalance} credits
            </Text>
          </div>
          <div className="flex justify-between items-center text-sm">
            <Text className="!text-gray-600">Balance After Unlock:</Text>
            <Text strong className="!text-green-600">
              {currentBalance - creditCost} credits
            </Text>
          </div>
        </div>

        <Divider className="!my-3" />

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <Text className="!text-blue-900 !text-xs block">
            <strong>What you get:</strong> View customer contact details and
            access to send a quote. One-time payment — no recurring charges for
            this job.
          </Text>
        </div>

        <Text className="!text-gray-400 !text-xs block">
          Credits are non-refundable unless the customer cancels this job.
        </Text>

        <div className="flex gap-3 pt-2">
          <Button block onClick={onClose} className="!h-11 !rounded-lg">
            Cancel
          </Button>
          <Button
            type="primary"
            block
            loading={loading}
            onClick={onConfirm}
            className="!bg-gray-900 hover:!bg-gray-800 !border-0 !h-11 !rounded-lg !font-medium"
          >
            Confirm & Unlock
          </Button>
        </div>
      </div>
    </Modal>
  );
}
