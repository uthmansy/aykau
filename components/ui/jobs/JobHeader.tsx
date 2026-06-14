"use client";

import { Button } from "antd";
import { ArrowLeftOutlined, WalletOutlined } from "@ant-design/icons";

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
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          className="rounded-lg! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! h-auto! py-2! px-4! font-inter! text-[14px]!"
          icon={<ArrowLeftOutlined className="text-[16px]" />}
        >
          Back
        </Button>
        <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Job Details
        </span>
      </div>

      {showBalance && creditBalance !== undefined && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
          <WalletOutlined className="text-primary text-[16px]" />
          <span className="font-inter text-[14px] font-medium text-primary">
            Balance: <strong>{creditBalance}</strong> credits
          </span>
        </div>
      )}
    </div>
  );
}
