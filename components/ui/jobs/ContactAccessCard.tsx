"use client";

import { Avatar, Button, Tooltip } from "antd";
import {
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  WalletOutlined,
} from "@ant-design/icons";

interface Props {
  isUnlocked: boolean;
  customer: any;
  creditBalance: number;
  onUnlock: () => void;
  onSendQuote: () => void;
  loading?: boolean;
  creditCost: number;
}

export default function ContactAccessCard({
  isUnlocked,
  customer,
  creditBalance,
  onUnlock,
  onSendQuote,
  loading,
  creditCost,
}: Props) {
  if (isUnlocked) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success-emerald/10 flex items-center justify-center">
            <UnlockOutlined className="text-success-emerald text-[18px]" />
          </div>
          <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-success-emerald">
            Customer Contact & Quote Access
          </h3>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
            <div className="flex items-center gap-4 mb-6">
              <Avatar
                size={64}
                src={customer?.avatar_url}
                icon={<UserOutlined />}
                className="bg-surface-container-lowest! text-on-surface-variant! ring-2! ring-outline-variant/30!"
              />
              <div>
                <p className="font-manrope text-[20px] font-semibold text-primary">
                  {customer?.full_name || customer?.username || "Customer"}
                </p>
                <p className="font-inter text-[14px] text-on-surface-variant">
                  Posted this job
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-outline-variant/30">
              {customer?.phone && (
                <div className="flex items-center gap-3">
                  <PhoneOutlined className="text-outline text-[16px]" />
                  <span className="font-inter text-[16px] text-on-surface">
                    {customer.phone}
                  </span>
                </div>
              )}
              {customer?.email && (
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-outline text-[16px]" />
                  <span className="font-inter text-[16px] text-on-surface">
                    {customer.email}
                  </span>
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
            className="rounded-lg! h-auto! py-3.5! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[16px]! font-medium! shadow-lg! shadow-secondary/20!"
          >
            Send Quote Now
          </Button>
        </div>
      </div>
    );
  }

  // Locked State
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 md:p-8 overflow-hidden relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-on-surface-variant/10 flex items-center justify-center">
          <LockOutlined className="text-on-surface-variant text-[18px]" />
        </div>
        <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Unlock to View Contact & Send Quote
        </h3>
      </div>

      <div className="relative">
        {/* Blurred Dummy Content */}
        <div className="space-y-4 opacity-20 pointer-events-none select-none filter blur-sm">
          <div className="h-24 bg-surface-container rounded-2xl" />
          <div className="h-14 bg-surface-container rounded-lg w-full" />
        </div>

        {/* ✅ Level 2 Glassmorphic Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-glass backdrop-blur-glass border border-white/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-5">
            <LockOutlined className="text-3xl text-primary" />
          </div>
          <h4 className="font-manrope text-[24px] font-semibold text-primary mb-2">
            Unlock for {creditCost} Credits
          </h4>
          <p className="font-inter text-[16px] text-on-surface-variant mb-6 max-w-sm">
            View customer contact details and gain access to send a quote for
            this job.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <Tooltip title="Your current credit balance">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container rounded-lg border border-outline-variant/30">
                <WalletOutlined className="text-on-surface-variant" />
                <span className="font-inter text-[14px] text-on-surface-variant">
                  Balance:{" "}
                  <strong className="text-on-surface">{creditBalance}</strong>
                </span>
              </div>
            </Tooltip>
            <Button
              type="primary"
              size="large"
              icon={<UnlockOutlined />}
              onClick={onUnlock}
              loading={loading}
              className="rounded-lg! h-auto! py-3! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium! flex-1! sm:flex-none!"
            >
              Unlock Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
