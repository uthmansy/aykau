"use client";

import { Avatar, Badge, Button, Tooltip } from "antd";
import {
  UserOutlined,
  CheckCircleFilled,
  LockOutlined,
  UnlockOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import useJobCreditCost from "@/hooks/useJobCreditCost";

interface Props {
  job: JobListing;
  isUnlocked: boolean;
  isArtisanViewer: boolean;
  creditBalance: number;
  onUnlock: () => void;
  loadingUnlock: boolean;
}

export default function ClientSection({
  job,
  isUnlocked,
  isArtisanViewer,
  creditBalance,
  onUnlock,
  loadingUnlock,
}: Props) {
  const poster = job.poster;
  const posterName = poster?.full_name || poster?.username || "Anonymous";
  const creditCost = useJobCreditCost(job);

  if (isArtisanViewer && !isUnlocked) {
    return (
      <div className="space-y-4">
        <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
          About the Client
        </h3>
        <div className="relative rounded-2xl overflow-hidden min-h-[260px] border border-outline-variant/20">
          <div className="opacity-20 pointer-events-none select-none filter blur-sm p-5 bg-surface-container h-full flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-container-high" />
            <div className="flex-1 space-y-2 pt-2">
              <div className="h-4 bg-surface-container-high rounded w-32" />
              <div className="h-3 bg-surface-container-high rounded w-24" />
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-glass backdrop-blur-glass border border-white/20 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <LockOutlined className="text-3xl text-primary" />
            </div>
            <p className="font-manrope text-[24px] font-semibold text-primary mb-2">
              Unlock for {creditCost} Credits
            </p>
            <p className="font-inter text-[14px] text-on-surface-variant mb-5 max-w-xs">
              View client contact details and send a quote
            </p>
            <Button
              type="primary"
              size="large"
              icon={<UnlockOutlined />}
              onClick={onUnlock}
              loading={loadingUnlock}
              className="rounded-lg! h-auto! py-3! px-6! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
            >
              Unlock Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
        About the Client
      </h3>
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
        <div className="flex items-start gap-4">
          <Tooltip title={poster?.is_verified ? "Verified member" : undefined}>
            <Badge
              count={
                poster?.is_verified ? (
                  <CheckCircleFilled
                    style={{ color: "var(--success-emerald)", fontSize: 18 }}
                  />
                ) : undefined
              }
              offset={[-5, 8]}
            >
              <Avatar
                size={56}
                src={poster?.avatar_url}
                className="bg-surface-container-lowest! text-on-surface-variant! ring-2! ring-outline-variant/30!"
                icon={<UserOutlined />}
              />
            </Badge>
          </Tooltip>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="font-manrope text-[16px] font-semibold text-on-surface">
                {posterName}
              </h4>
              {poster?.is_verified && (
                <span className="px-2 py-0.5 rounded-full bg-success-emerald/10 text-success-emerald font-inter text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </span>
              )}
              {isUnlocked && isArtisanViewer && (
                <span className="px-2 py-0.5 rounded-full bg-success-emerald/10 text-success-emerald font-inter text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <UnlockOutlined className="text-[10px]" /> Unlocked
                </span>
              )}
            </div>
            {isUnlocked && poster?.phone && (
              <div className="flex items-center gap-2 font-inter text-[14px] text-on-surface pt-3 border-t border-outline-variant/30">
                <PhoneOutlined className="text-outline" /> {poster.phone}
              </div>
            )}
          </div>
        </div>
        {isUnlocked &&
          job.contact_methods?.length &&
          job.contact_methods.length > 0 && (
            <div className="mt-4 pt-4 border-t border-outline-variant/30">
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-2">
                Preferred Contact
              </span>
              <div className="flex flex-wrap gap-2">
                {job.contact_methods.map((method) => {
                  const config: Record<string, { icon: any; label: string }> = {
                    email: { icon: MailOutlined, label: "Email" },
                    phone: { icon: PhoneOutlined, label: "Phone" },
                    in_app: { icon: MessageOutlined, label: "In-App" },
                  };
                  const { icon: Icon, label } = config[method] || {
                    icon: MessageOutlined,
                    label: method,
                  };
                  return (
                    <span
                      key={method}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 font-inter text-[12px] font-medium text-on-surface-variant"
                    >
                      <Icon className="text-[12px]" /> {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
