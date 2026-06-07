// components/jobs/ContactAccessCard.tsx
import { Card, Typography, Avatar, Button, Tooltip } from "antd";
import {
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  WalletOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface Props {
  isUnlocked: boolean;
  customer: any;
  creditBalance: number;
  onUnlock: () => void;
  onSendQuote: () => void;
  loading?: boolean;
}

export default function ContactAccessCard({
  isUnlocked,
  customer,
  creditBalance,
  onUnlock,
  onSendQuote,
  loading,
}: Props) {
  if (isUnlocked) {
    return (
      <Card className="!rounded-2xl !border-gray-200 !shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <UnlockOutlined className="text-green-600 text-lg" />
          <Text strong className="!text-gray-900 !text-base">
            Customer Contact & Quote Access
          </Text>
        </div>

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <Avatar
                size={56}
                src={customer?.avatar_url}
                icon={<UserOutlined />}
                className="!bg-gray-200 !text-gray-600 !border !border-gray-300"
              />
              <div className="flex-1">
                <Text strong className="!text-gray-900 !text-base block">
                  {customer?.full_name || customer?.username || "Customer"}
                </Text>
                <Text className="!text-gray-500 !text-xs">Posted this job</Text>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-200">
              {customer?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <PhoneOutlined className="text-gray-400" />
                  <Text className="!text-gray-700">{customer.phone}</Text>
                </div>
              )}
              {customer?.email && (
                <div className="flex items-center gap-3 text-sm">
                  <MailOutlined className="text-gray-400" />
                  <Text className="!text-gray-700">{customer.email}</Text>
                </div>
              )}
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block
            icon={<CheckCircleOutlined />}
            onClick={onSendQuote}
            className="!bg-gray-900 hover:!bg-gray-800 !border-0 !h-12 !rounded-xl !font-medium !text-base"
          >
            Send Quote Now
          </Button>
        </div>
      </Card>
    );
  }

  // Locked State
  return (
    <Card className="!rounded-2xl !border-gray-200 !shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <LockOutlined className="text-gray-400 text-lg" />
        <Text strong className="!text-gray-900 !text-base">
          Unlock to View Contact & Send Quote
        </Text>
      </div>

      <div className="relative">
        {/* Blurred Dummy Content */}
        <div className="space-y-3 opacity-30 pointer-events-none select-none filter blur-sm">
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="h-12 bg-gray-900 rounded-lg w-full" />
        </div>

        {/* Overlay Prompt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl p-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <LockOutlined className="text-3xl text-gray-500" />
          </div>
          <Text strong className="!text-gray-900 !text-lg mb-1 text-center">
            Unlock for {10} Credits
          </Text>
          <Text className="!text-gray-500 !text-sm mb-5 text-center max-w-sm">
            View customer contact details and gain access to send a quote for
            this job.
          </Text>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <Tooltip title="Your current credit balance">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <WalletOutlined className="text-gray-500" />
                <Text className="!text-gray-700 !text-sm">
                  Balance:{" "}
                  <strong className="!text-gray-900">{creditBalance}</strong>
                </Text>
              </div>
            </Tooltip>
            <Button
              type="primary"
              size="large"
              icon={<UnlockOutlined />}
              onClick={onUnlock}
              loading={loading}
              className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-lg !h-11 !font-medium flex-1 sm:flex-none"
            >
              Unlock Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
