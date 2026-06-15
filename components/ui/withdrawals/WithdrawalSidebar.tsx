// components/dashboard/withdrawals/WithdrawalSidebar.tsx
import { Typography } from "antd";
import {
  InfoCircleOutlined,
  ClockCircleOutlined,
  BankOutlined,
  QuestionCircleOutlined,
  SafetyOutlined, // Replaced ShieldCheckOutlined with SafetyOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function WithdrawalSidebar() {
  return (
    <div className="space-y-6">
      {/* Policy Card - Light gray background, no border */}
      <div className="bg-surface-container-low p-6 rounded-xl">
        <Title
          level={5}
          className="!mb-5 !text-primary !font-manrope !font-semibold flex items-center gap-2"
        >
          <InfoCircleOutlined className="text-secondary text-base" /> Withdrawal
          Policy
        </Title>
        <div className="space-y-5">
          <div className="flex gap-3">
            <ClockCircleOutlined className="text-on-surface-variant! mt-0.5 flex-shrink-0" />
            <div>
              <Text
                strong
                className="block text-sm! text-on-surface mb-0.5 font-inter"
              >
                Processing Time
              </Text>
              <Text className="text-xs! text-on-surface-variant! leading-relaxed font-inter">
                1-3 business days depending on your bank's schedule.
              </Text>
            </div>
          </div>
          <div className="flex gap-3">
            <BankOutlined className="text-on-surface-variant! mt-0.5 flex-shrink-0" />
            <div>
              <Text
                strong
                className="block text-sm! text-on-surface mb-0.5 font-inter"
              >
                Minimum Withdrawal
              </Text>
              <Text className="text-xs! text-on-surface-variant! leading-relaxed font-inter">
                The minimum amount you can cash out is ₦2,000.00.
              </Text>
            </div>
          </div>
          <div className="flex gap-3">
            <QuestionCircleOutlined className="text-on-surface-variant! mt-0.5 flex-shrink-0" />
            <div>
              <Text
                strong
                className="block text-sm! text-on-surface mb-0.5 font-inter"
              >
                Need Help?
              </Text>
              <Text className="text-xs! text-on-surface-variant! leading-relaxed font-inter">
                Visit our Support Center for common withdrawal issues.
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Transactions Card - Dark navy, no border, with image */}
      <div className="bg-primary rounded-xl overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <SafetyOutlined className="text-4xl text-white!" />
          </div>
          <Title
            level={4}
            className="!mb-2 !text-white !font-manrope !font-semibold"
          >
            Secure Transactions
          </Title>
          <Paragraph className="!mb-0 text-sm! text-white/60! leading-relaxed! font-inter px-2">
            Every withdrawal is encrypted using 256-bit SSL and undergoes a
            multi-layer security check to ensure your funds reach you safely.
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
