// components/jobs/JobHeader.tsx
import { Typography, Tag, Button } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined, // 🟢 Fixed: Use EnvironmentOutlined instead of MapPinOutlined
  WalletOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  job: any;
  onBack: () => void;
  creditBalance?: number;
  showBalance?: boolean;
}

export default function JobHeader({
  job,
  onBack,
  creditBalance,
  showBalance,
}: Props) {
  const formatBudget = (budgetKey: string) => {
    const map: Record<string, string> = {
      "under-10k": "Under ₦10,000",
      "10k-50k": "₦10,000 - ₦50,000",
      "50k-100k": "₦50,000 - ₦100,000",
      "100k-500k": "₦100,000 - ₦500,000",
      "500k+": "₦500,000+",
      flexible: "Flexible / Get Quotes",
    };
    return map[budgetKey] || budgetKey;
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-gray-500"
      >
        Back
      </Button>
      <div className="flex-1">
        <Text className="!text-gray-500 !text-xs uppercase tracking-wide">
          Job Details
        </Text>
      </div>
      {showBalance && creditBalance !== undefined && (
        <Tag
          icon={<WalletOutlined />}
          color="default"
          className="!rounded-full !px-3 !py-1 !text-xs !font-medium"
        >
          Your Balance: {creditBalance} credits
        </Tag>
      )}
    </div>
  );
}
