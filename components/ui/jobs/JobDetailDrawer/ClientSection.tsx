// components/jobs/ClientSection.tsx
"use client";

import { Avatar, Badge, Tag, Button, Tooltip } from "antd";
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
import useJobCreditCost from "@/hooks/useJobCreditCost"; // 🟢 Import hook

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
  const creditCost = useJobCreditCost(job); // 🟢 Use hook

  // 🔒 LOCKED STATE
  if (isArtisanViewer && !isUnlocked) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          About the Client
        </h3>

        <div className="relative rounded-xl overflow-hidden min-h-[260px]">
          {/* Blurred Content */}
          <div className="opacity-30 pointer-events-none select-none filter blur-sm p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl h-full">
            <div className="flex items-start gap-4">
              <Avatar
                size={56}
                icon={<UserOutlined />}
                className="bg-gray-200"
              />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32" />
                <div className="h-3 bg-gray-300 rounded w-24" />
                <div className="h-3 bg-gray-300 rounded w-40" />
                <div className="h-3 bg-gray-300 rounded w-28" />
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[3px] rounded-xl p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-sm">
              <LockOutlined className="text-2xl text-gray-600" />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1 text-center">
              Unlock for {creditCost} Credits
            </p>
            <p className="text-sm text-gray-500 mb-5 text-center max-w-xs">
              View client contact details and send a quote
            </p>
            <Button
              type="primary"
              size="large"
              icon={<UnlockOutlined />}
              onClick={onUnlock}
              loading={loadingUnlock}
              className="bg-gray-900 hover:bg-gray-800 border-0 rounded-lg h-11 px-6 font-medium shadow-sm"
            >
              Unlock Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ UNLOCKED STATE
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        About the Client
      </h3>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
        <div className="flex items-start gap-4">
          <Tooltip title={poster?.is_verified ? "Verified member" : undefined}>
            <Badge
              count={
                poster?.is_verified ? (
                  <CheckCircleFilled
                    style={{ color: "#10b981", fontSize: 18 }}
                  />
                ) : undefined
              }
              offset={[-5, 8]}
            >
              <Avatar
                size={56}
                src={poster?.avatar_url}
                className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border-2 border-white shadow-sm"
                icon={<UserOutlined style={{ fontSize: 24 }} />}
              />
            </Badge>
          </Tooltip>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="font-semibold text-gray-900 text-base">
                {posterName}
              </h4>
              {poster?.is_verified && (
                <Tag
                  color="success"
                  className="text-xs py-0 px-2 rounded-full border-0"
                >
                  Verified
                </Tag>
              )}
              {isUnlocked && isArtisanViewer && (
                <Tag
                  icon={<UnlockOutlined />}
                  color="success"
                  className="text-xs py-0 px-2 rounded-full border-0"
                >
                  Unlocked
                </Tag>
              )}
            </div>

            {/* Contact info */}
            {isUnlocked && (
              <div className="space-y-2 pt-3 border-t border-gray-200">
                {poster?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneOutlined className="text-gray-400" />
                    <span className="text-gray-700">{poster.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Methods */}
        {isUnlocked &&
          job.contact_methods?.length &&
          job.contact_methods.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Preferred Contact
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
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
                    <Tag
                      key={method}
                      icon={<Icon className="text-gray-500" />}
                      className="rounded-full py-1 px-3 text-xs border-gray-200 bg-white"
                    >
                      {label}
                    </Tag>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
