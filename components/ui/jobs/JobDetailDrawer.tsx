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
} from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import { SERVICE_CATEGORIES, SERVICE_SUBCATEGORIES } from "../JobPostingForm";

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
  const [loading, setLoading] = useState(false);

  // Optional: Fetch additional details when drawer opens
  useEffect(() => {
    if (open && job?.id) {
      // Could fetch extended job details, activity, etc. here
      // setLoading(true); ... then setLoading(false) when done
    }
  }, [open, job?.id]);

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
        {job.is_expired && (
          <Tag color="default" className="font-medium">
            Expired
          </Tag>
        )}
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
          {job.service_location}
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

  const AboutClientSection = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        About the Client
      </h3>

      <div className="flex items-start gap-4 p-4 bg-linear-to-br from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100">
        <Tooltip title={poster?.is_verified ? "Verified member" : undefined}>
          <Badge
            count={
              poster?.is_verified ? (
                <CheckCircleFilled style={{ color: "#10b981", fontSize: 16 }} />
              ) : undefined
            }
            offset={[-5, 8]}
          >
            <Avatar
              size={56}
              src={poster?.avatar_url}
              className="bg-linear-to-br from-blue-100 to-indigo-100 text-blue-600 border-2 border-white shadow-sm"
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
          </div>

          <div className="mt-2 space-y-1.5 text-sm text-gray-500">
            {/* {poster?.location && (
              <p className="flex items-center gap-1.5">
                <EnvironmentOutlined className="text-gray-400" />
                {poster.location}
              </p>
            )}
            {poster?.created_at && (
              <p className="flex items-center gap-1.5">
                <ClockCircleOutlined className="text-gray-400" />
                Member since{" "}
                {new Date(poster.created_at).toLocaleDateString("en-NG", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )} */}
            {/* Rating placeholder - uncomment when available */}
            {/* {poster?.rating && (
              <p className="flex items-center gap-1 text-amber-500">
                <StarFilled />
                <span className="text-gray-700">{poster.rating}</span>
                {poster.reviews !== undefined && (
                  <span className="text-gray-400">({poster.reviews} reviews)</span>
                )}
              </p>
            )} */}
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      {job.contact_methods?.length && job.contact_methods.length > 0 && (
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

      {/* {poster?.bio && (
        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
          {poster.bio}
        </p>
      )} */}
    </div>
  );

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
            <EyeOutlined className="text-blue-500 text-xl mb-1" />
            <div className="text-2xl font-bold text-gray-900">
              {activity.viewed_count}
            </div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <MessageOutlined className="text-green-500 text-xl mb-1" />
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
                icon: <MessageOutlined style={{ color: "#3b82f6" }} />,
              },
              // Add more dynamic items based on actual activity data
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
            <Button
              type="primary"
              size="large"
              className="w-full h-12 text-base font-medium bg-linear-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
              icon={<MessageOutlined />}
              onClick={() => {
                onClose();
                onQuoteClick?.(job.id);
              }}
            >
              Send Quote to {posterName}
            </Button>
            <p className="text-xs text-gray-400 text-center mt-2">
              You'll be able to discuss details before confirming
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
