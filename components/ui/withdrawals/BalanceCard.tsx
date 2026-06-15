// components/dashboard/withdrawals/BalanceCard.tsx
import { Typography } from "antd";
import { RiseOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  availableBalance: number;
  lifetimeEarnings: number;
}

export default function BalanceCard({
  availableBalance,
  lifetimeEarnings,
}: Props) {
  return (
    <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div>
          <Text className="text-xs! font-semibold! uppercase tracking-widest text-on-surface-variant! block mb-3 font-inter">
            Available Balance
          </Text>
          <Title
            level={2}
            className="!mb-0 !text-primary !font-manrope !font-bold tracking-tight"
          >
            ₦
            {availableBalance.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </Title>
        </div>

        <div className="md:text-right">
          <Text className="text-xs! font-semibold! uppercase tracking-widest text-on-surface-variant! block mb-3 font-inter flex md:justify-end items-center gap-1">
            <RiseOutlined className="text-secondary" /> Total Lifetime Earnings
          </Text>
          <Title
            level={3}
            className="!mb-0 !text-secondary !font-manrope !font-semibold!"
          >
            ₦
            {lifetimeEarnings.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </Title>
        </div>
      </div>
    </div>
  );
}
