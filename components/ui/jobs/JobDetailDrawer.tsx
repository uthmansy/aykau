"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  Avatar,
  Badge,
  Tag,
  Button,
  Divider,
  Timeline,
  Tooltip,
  Skeleton,
  Modal,
  App,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  UserOutlined,
  CheckCircleFilled,
  MessageOutlined,
  EyeOutlined,
  CalendarOutlined,
  LinkOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import { SERVICE_CATEGORIES, SERVICE_SUBCATEGORIES } from "../JobPostingForm";
import Link from "next/link";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

interface Props {
  job: JobListing | null;
  open: boolean;
  onClose: () => void;
  onQuoteClick?: (jobId: string) => void;
}

export default function JobDetailDrawer({
  job,
  open,
  onClose,
  onQuoteClick,
}: Props) {
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);
  const userRole = useAuthStore((state) => state.user?.role);

  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loadingUnlock, setLoadingUnlock] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Determine user's relationship to this job
  const isCustomer = job && userId && job.customer_id === userId;
  const isArtisanViewer = userRole === "artisan" && !isCustomer;

  // Check unlock status when drawer opens
  useEffect(() => {
    if (open && job?.id && userId && isArtisanViewer) {
      checkUnlockStatus();
    } else if (isCustomer) {
      setIsUnlocked(true); // Customers always see everything
    }
  }, [open, job?.id, userId, isArtisanViewer, isCustomer]);

  const checkUnlockStatus = async () => {
    if (!job?.id || !userId) return;

    try {
      // Check if already unlocked
      const { data: unlockData } = await supabase
        .from("unlocked_jobs")
        .select("id")
        .eq("job_id", job.id)
        .eq("artisan_id", userId)
        .eq("is_refunded", false)
        .maybeSingle();

      setIsUnlocked(!!unlockData);

      // Fetch current credit balance
      const { data: walletData } = await supabase
        .from("wallets")
        .select("credit_balance")
        .eq("user_id", userId)
        .single();

      setCreditBalance(Number(walletData?.credit_balance || 0));
    } catch (error) {
      console.error("Error checking unlock status:", error);
    }
  };

  const handleUnlockClick = () => {
    const cost = job?.credit_cost || 10;
    if (creditBalance >= cost) {
      setShowConsentModal(true);
    } else {
      message.warning(
        `You need ${cost} credits to unlock this job. Your balance is ${creditBalance}.`
      );
      // TODO: Open "Buy Credits" modal
    }
  };

  const confirmUnlock = async () => {
    if (!job?.id) return;

    setLoadingUnlock(true);
    try {
      const { data, error } = await supabase.rpc("unlock_job", {
        p_job_id: job.id,
      });

      if (error) throw error;

      if (data?.success) {
        message.success("Job unlocked successfully!");
        setIsUnlocked(true);
        setCreditBalance((prev) => prev - (job.credit_cost || 10));
        setShowConsentModal(false);
      }
    } catch (error: any) {
      console.error("Unlock error:", error);
      if (error.message?.includes("insufficient_credits")) {
        message.error("Insufficient credits. Please buy more credits.");
      } else {
        message.error("Failed to unlock job. Please try again.");
      }
    } finally {
      setLoadingUnlock(false);
    }
  };

  if (!job) return null;

  const categoryConfig = SERVICE_CATEGORIES.find(
    (c) => c.value === job.category
  );
  const subcategoryConfig = SERVICE_SUBCATEGORIES[job.category]?.find(
    (s) => s.value === job.subcategory
  );

  const budgetLabel =
    {
      "under-10k": "Under ₦10k",
      "10k-50k": "₦10k – ₦50k",
      "50k-100k": "₦50k – ₦100k",
      "100k-500k": "₦100k – ₦500k",
      "500k+": "₦500k+",
      flexible: "Flexible",
    }[job.budget] || job.budget;

  const urgencyConfig = {
    asap: { label: "Urgent", color: "red", icon: "🔥" },
    "this-week": { label: "This Week", color: "orange", icon: "📅" },
    "this-month": { label: "This Month", color: "blue", icon: "🗓️" },
    planning: { label: "Flexible", color: "default", icon: "✨" },
  }[job.urgency] || { label: "Flexible", color: "default", icon: "✨" };

  const poster = job.poster;
  const posterName = poster?.full_name || poster?.username || "Anonymous";

  // ───────── Section Components ─────────

  const HeaderSection = () => (
    <div className="space-y-4">
      {/* Back Button + Close */}
      <div className="flex items-center justify-between">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          {isArtisanViewer && !isUnlocked && (
            <Tag
              icon={<WalletOutlined />}
              color="default"
              className="!rounded-full !px-3 !py-1 !text-xs !font-medium"
            >
              Balance: {creditBalance} credits
            </Tag>
          )}
          {job.is_expired && (
            <Tag color="default" className="font-medium">
              Expired
            </Tag>
          )}
        </div>
      </div>

      {/* Category + Urgency */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          {categoryConfig?.label}
        </span>
        <Tag
          color={urgencyConfig.color}
          className="py-1 px-3 text-sm font-medium rounded-full flex items-center gap-1"
        >
          <span>{urgencyConfig.icon}</span>
          {urgencyConfig.label}
        </Tag>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 leading-tight">
        {subcategoryConfig?.label || job.subcategory}
      </h2>

      {/* Meta Row */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <WalletOutlined className="text-gray-400" />
          <strong className="text-gray-700">{budgetLabel}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <EnvironmentOutlined className="text-gray-400" />
          {job.state_code}
        </span>
        {job.preferred_date && (
          <span className="flex items-center gap-1.5">
            <CalendarOutlined className="text-gray-400" />
            {new Date(job.preferred_date).toLocaleDateString("en-NG", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );

  const JobContentSection = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Job Description
        </h3>
        <div className="prose prose-sm prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      </div>

      {/* Photos */}
      {job.photo_urls?.length && job.photo_urls.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Attachments
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {job.photo_urls.slice(0, 6).map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Attachment ${idx + 1}`}
                className="aspect-square object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional Details */}
      {(job.access_notes || job.frequency || job.custom_details) && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {job.access_notes && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Access Notes
              </span>
              <p className="text-sm text-gray-700 mt-1">{job.access_notes}</p>
            </div>
          )}
          {job.frequency && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Frequency
              </span>
              <p className="text-sm text-gray-700 mt-1 capitalize">
                {job.frequency}
              </p>
            </div>
          )}
          {job.custom_details && Object.keys(job.custom_details).length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Additional Details
              </span>
              <div className="mt-2 space-y-2">
                {Object.entries(job.custom_details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="text-gray-700 font-medium">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const AboutClientSection = () => {
    // 🔒 LOCKED STATE: Show blurred overlay for artisans who haven't unlocked
    if (isArtisanViewer && !isUnlocked) {
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            About the Client
          </h3>

          <div className="relative">
            {/* Blurred Content */}
            <div className="opacity-30 pointer-events-none select-none filter blur-sm">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Avatar
                  size={56}
                  icon={<UserOutlined />}
                  className="bg-gray-200"
                />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-32" />
                  <div className="h-3 bg-gray-300 rounded w-24" />
                </div>
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-xl p-6">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <LockOutlined className="text-2xl text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1 text-center">
                Unlock for {job.credit_cost || 10} Credits
              </p>
              <p className="text-xs text-gray-500 mb-4 text-center max-w-xs">
                View client contact details and send a quote
              </p>
              <Button
                type="primary"
                icon={<UnlockOutlined />}
                onClick={handleUnlockClick}
                loading={loadingUnlock}
                className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-lg !h-10 !font-medium"
              >
                Unlock Now
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // ✅ UNLOCKED STATE or CUSTOMER VIEW
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          About the Client
        </h3>

        <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
          <Tooltip title={poster?.is_verified ? "Verified member" : undefined}>
            <Badge
              count={
                poster?.is_verified ? (
                  <CheckCircleFilled
                    style={{ color: "#10b981", fontSize: 16 }}
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
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900">{posterName}</h4>
              {poster?.is_verified && (
                <Tag color="green" className="text-xs py-0 px-2 rounded-full">
                  Verified
                </Tag>
              )}
              {isUnlocked && isArtisanViewer && (
                <Tag
                  icon={<UnlockOutlined />}
                  color="success"
                  className="text-xs py-0 px-2 rounded-full"
                >
                  Unlocked
                </Tag>
              )}
            </div>

            <div className="mt-2 space-y-1.5 text-sm text-gray-500">
              {/* Contact info - only shown when unlocked */}
              {isUnlocked && (
                <>
                  {poster?.phone && (
                    <p className="flex items-center gap-1.5">
                      <PhoneOutlined className="text-gray-400" />
                      {poster.phone}
                    </p>
                  )}
                  {/* {poster?.email && (
                    <p className="flex items-center gap-1.5">
                      <MailOutlined className="text-gray-400" />
                      {poster.email}
                    </p>
                  )} */}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        {isUnlocked &&
          job.contact_methods?.length &&
          job.contact_methods.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Preferred Contact
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.contact_methods.map((method) => {
                  const config: Record<string, { icon: any; label: string }> = {
                    email: { icon: MailOutlined, label: "Email" },
                    phone: { icon: PhoneOutlined, label: "Phone" },
                    in_app: { icon: MessageOutlined, label: "In-App Message" },
                  };
                  const { icon: Icon, label } = config[method] || {
                    icon: MessageOutlined,
                    label: method,
                  };
                  return (
                    <Tag
                      key={method}
                      icon={<Icon className="text-gray-500" />}
                      className="rounded-full py-1 px-3 text-sm"
                    >
                      {label}
                    </Tag>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    );
  };

  const JobActivitySection = () => {
    const activity = {
      viewed_count: job.viewed_count || 0,
      quote_count: job.quote_count || 0,
    };

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Job Activity
        </h3>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <EyeOutlined className="text-gray-500 text-xl mb-1" />
            <div className="text-2xl font-bold text-gray-900">
              {activity.viewed_count}
            </div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <MessageOutlined className="text-gray-500 text-xl mb-1" />
            <div className="text-2xl font-bold text-gray-900">
              {activity.quote_count}
            </div>
            <div className="text-xs text-gray-500">Quotes</div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            Recent Activity
          </span>
          <Timeline
            className="mt-3"
            mode="start"
            items={[
              {
                content: (
                  <div className="text-sm">
                    <strong className="text-gray-900">Job Posted</strong>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(job.created_at!).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ),
                icon: <CheckCircleFilled style={{ color: "#10b981" }} />,
              },
              {
                content: (
                  <div className="text-sm">
                    <strong className="text-gray-900">
                      First Quote Received
                    </strong>
                    <p className="text-gray-500 text-xs mt-0.5">2 hours ago</p>
                  </div>
                ),
                icon: <MessageOutlined style={{ color: "#6b7280" }} />,
              },
            ]}
          />
        </div>

        {/* Expires */}
        {job.expires_at && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
            <ClockCircleOutlined className="text-amber-500 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium text-amber-800">Expires in </span>
              <span className="text-amber-700">
                {Math.ceil(
                  (new Date(job.expires_at).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </span>
              <p className="text-amber-600 text-xs mt-0.5">
                {new Date(job.expires_at).toLocaleDateString("en-NG", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        size={480}
        closable={false}
        maskClosable={true}
        className="job-detail-drawer"
        styles={{
          body: { padding: 0, background: "#fafafa" },
          mask: { background: "rgba(0,0,0,0.4)" },
        }}
      >
        <div className="h-full flex flex-col bg-white">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
            <HeaderSection />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <>
                <JobContentSection />
                <Divider className="my-2!" />
                <AboutClientSection />
                <Divider className="my-2!" />
                <JobActivitySection />
              </>
            )}
          </div>

          {/* Sticky Footer Action */}
          {!job.is_expired && (
            <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-4">
              {isArtisanViewer && !isUnlocked ? (
                // 🔒 LOCKED: Show unlock prompt
                <div className="space-y-2">
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<UnlockOutlined />}
                    onClick={handleUnlockClick}
                    loading={loadingUnlock}
                    className="!bg-gray-900 hover:!bg-gray-800 !border-0 !h-12 !text-base !font-medium !rounded-lg"
                  >
                    Unlock & Send Quote ({job.credit_cost || 10} Credits)
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Unlock to view client contact and send your quote
                  </p>
                </div>
              ) : (
                // ✅ UNLOCKED or CUSTOMER: Show send quote button
                <Link href={`jobs/send-quote/${job.id}`}>
                  <Button
                    type="primary"
                    size="large"
                    className="w-full h-12 text-base font-medium bg-gray-900 border-0 hover:bg-gray-800 shadow-sm !rounded-lg"
                    icon={<MessageOutlined />}
                  >
                    Send Quote to {posterName}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </Drawer>

      {/* Consent Modal */}
      <Modal
        title="Confirm Unlock"
        open={showConsentModal}
        onCancel={() => setShowConsentModal(false)}
        footer={null}
        width={480}
        centered
      >
        <div className="py-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="font-semibold text-gray-900 mb-1">
              {subcategoryConfig?.label || job.subcategory}
            </p>
            <p className="text-sm text-gray-500">
              Unlock cost:{" "}
              <strong className="text-gray-900">
                {job.credit_cost || 10} credits
              </strong>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Current Balance:</span>
              <strong className="text-gray-900">{creditBalance} credits</strong>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Balance After Unlock:</span>
              <strong className="text-green-600">
                {creditBalance - (job.credit_cost || 10)} credits
              </strong>
            </div>
          </div>

          <Divider className="!my-3" />

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-blue-900 text-xs">
              <strong>What you get:</strong> View client contact details and
              access to send a quote. One-time payment — no recurring charges
              for this job.
            </p>
          </div>

          <p className="text-gray-400 text-xs">
            Credits are non-refundable unless the client cancels this job.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              block
              onClick={() => setShowConsentModal(false)}
              className="!h-11 !rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              block
              loading={loadingUnlock}
              onClick={confirmUnlock}
              className="!bg-gray-900 hover:!bg-gray-800 !border-0 !h-11 !rounded-lg !font-medium"
            >
              Confirm & Unlock
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
