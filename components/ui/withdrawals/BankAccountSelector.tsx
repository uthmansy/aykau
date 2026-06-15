// components/dashboard/withdrawals/BankAccountSelector.tsx
import { Typography } from "antd";
import {
  BankOutlined,
  PlusOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

const { Text } = Typography;

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  is_default: boolean;
}

interface Props {
  accounts: BankAccount[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

export default function BankAccountSelector({
  accounts,
  selectedId,
  onSelect,
  onAddNew,
}: Props) {
  return (
    <div className="space-y-3">
      <Text strong className="text-sm text-on-surface block mb-2 font-inter">
        Select Destination Bank Account
      </Text>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {accounts.map((account) => {
          const isSelected = selectedId === account.id;
          return (
            <div
              key={account.id}
              onClick={() => onSelect(account.id)}
              className={`
                relative p-4 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between
                ${
                  isSelected
                    ? "bg-surface-container-high border-2 border-secondary"
                    : "bg-surface-container-lowest border-2 border-outline-variant hover:border-primary/50"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                  ${isSelected ? "bg-secondary/10 text-secondary" : "bg-surface-container text-on-surface-variant group-hover:text-primary"}
                `}
                >
                  <BankOutlined className="text-lg" />
                </div>
                <div>
                  <Text
                    strong
                    className="block text-sm text-on-surface font-inter leading-tight"
                  >
                    {account.bank_name}
                  </Text>
                  <Text className="text-xs text-on-surface-variant font-mono tracking-wide">
                    **** {account.account_number.slice(-4)}
                  </Text>
                </div>
              </div>
              {isSelected && (
                <CheckCircleFilled className="text-secondary text-xl" />
              )}
            </div>
          );
        })}

        <button
          onClick={onAddNew}
          className="p-4 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low/30 flex items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <PlusOutlined className="text-on-surface-variant group-hover:text-primary" />
          </div>
          <Text className="text-sm text-on-surface-variant group-hover:text-primary font-medium font-inter">
            Add New Bank
          </Text>
        </button>
      </div>
    </div>
  );
}
