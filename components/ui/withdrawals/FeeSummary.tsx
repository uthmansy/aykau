// components/dashboard/withdrawals/FeeSummary.tsx
import { Typography, Divider } from "antd";

const { Text } = Typography;

interface Props {
  amount: number;
  fee: number;
  netAmount: number;
}

export default function FeeSummary({ amount, fee, netAmount }: Props) {
  if (amount <= 0) return null;

  return (
    <div className="bg-surface-container p-5 rounded-xl space-y-3">
      <div className="flex justify-between items-center">
        <Text className="text-sm text-on-surface-variant font-inter">
          Withdrawal Amount
        </Text>
        <Text className="text-sm text-on-surface font-medium font-inter">
          ₦{amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </Text>
      </div>
      <div className="flex justify-between items-center">
        <Text className="text-sm text-on-surface-variant font-inter">
          Processing Fee (0.5%)
        </Text>
        <Text className="text-sm text-on-surface font-medium font-inter">
          {fee.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </Text>
      </div>
      <Divider className="!my-2 !border-outline-variant/50" />
      <div className="flex justify-between items-center">
        <Text strong className="text-base text-on-surface font-inter">
          Amount to Receive
        </Text>
        <Text strong className="text-xl text-primary font-manrope">
          ₦{netAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </Text>
      </div>
    </div>
  );
}
