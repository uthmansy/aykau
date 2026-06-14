"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Skeleton, Empty, Image } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  WalletOutlined,
  CalendarOutlined,
  KeyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import QuotesList from "@/components/ui/jobs/manage/QuotesList";
import EditJobDrawer from "@/components/ui/jobs/manage/EditJobDrawer";
import { JobListing } from "@/lib/jobs/types";

export default function ManageJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const userId = useAuthStore((state) => state.user?.id);

  const [job, setJob] = useState<JobListing | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!jobId || !userId) return;
      const { data: jobData, error } = await supabase
        .from("job_requests")
        .select(
          `*, poster:profiles!customer_id(full_name, username, avatar_url)`
        )
        .eq("id", jobId)
        .single();

      if (error || !jobData) {
        setLoading(false);
        return;
      }
      if (jobData.customer_id !== userId) {
        setIsUnauthorized(true);
        setLoading(false);
        return;
      }
      setJob(jobData);

      const { data: quotesData } = await supabase
        .from("job_quotes")
        .select(
          `*, artisan:profiles!artisan_id(full_name, username, avatar_url, is_verified)`
        )
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
      setQuotes(quotesData || []);
      setLoading(false);
    }
    fetchData();
  }, [jobId, userId]);

  const refreshQuotes = async () => {
    const { data } = await supabase
      .from("job_quotes")
      .select(
        `*, artisan:profiles!artisan_id(full_name, username, avatar_url, is_verified)`
      )
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    setQuotes(data || []);
  };

  if (loading) {
    return (
      // ✅ FIXED: Changed max-w-7xl to max-w-container-max and aligned padding
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto space-y-8">
        <Skeleton.Input active className="w-48 h-8 mb-4 rounded-lg!" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton.Button
            active
            className="!w-full !h-96 !rounded-2xl lg:!col-span-2"
          />
          <Skeleton.Button active className="!w-full !h-96 !rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
          <WarningOutlined className="text-error text-2xl" />
        </div>
        <h2 className="font-manrope text-[24px] font-semibold text-primary mb-2">
          Access Denied
        </h2>
        <p className="font-inter text-[16px] text-on-surface-variant mb-8 max-w-md">
          You don't have permission to manage this job.
        </p>
        <Button
          type="primary"
          onClick={() => router.push("/dashboard/jobs")}
          className="rounded-lg! h-auto! py-3! px-6! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium!"
        >
          Back to My Jobs
        </Button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Empty
          description="Job Not Found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          onClick={() => router.push("/dashboard/jobs")}
          className="mt-4 rounded-lg! h-auto! py-3! px-6! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const budgetLabels: Record<string, string> = {
    "under-10k": "Under ₦10k",
    "10k-50k": "₦10k – ₦50k",
    "50k-100k": "₦50k – ₦100k",
    "100k-500k": "₦100k – ₦500k",
    "500k+": "₦500k+",
    flexible: "Flexible",
  };
  const budgetLabel = budgetLabels[job.budget] || job.budget;

  const urgencyConfigs: Record<string, { label: string; icon: string }> = {
    asap: { label: "Urgent", icon: "🔥" },
    "this-week": { label: "This Week", icon: "📅" },
    "this-month": { label: "This Month", icon: "🗓️" },
    planning: { label: "Flexible", icon: "✨" },
  };
  const urgencyConfig = urgencyConfigs[job.urgency] || {
    label: "Flexible",
    icon: "✨",
  };

  const statusStyles = {
    open: { bg: "bg-success-emerald/10", text: "text-success-emerald" },
    closed: { bg: "bg-on-surface-variant/10", text: "text-on-surface-variant" },
    in_progress: { bg: "bg-primary/10", text: "text-primary" },
    cancelled: { bg: "bg-error/10", text: "text-error" },
    completed: { bg: "bg-success-emerald/10", text: "text-success-emerald" },
    expired: { bg: "bg-warning/10", text: "text-warning" },
  }[job.status ?? "open"] || {
    // Use nullish coalescing to provide a default key
    bg: "bg-on-surface-variant/10",
    text: "text-on-surface-variant",
  };

  return (
    // ✅ FIXED: Changed max-w-7xl to max-w-container-max and aligned padding
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-manrope text-[24px] md:text-[32px] font-semibold text-primary leading-tight">
            Manage Job Post
          </h1>
          <p className="font-inter text-[16px] text-on-surface-variant mt-1">
            Review details and manage incoming quotes.
          </p>
        </div>
        <Button
          icon={<EditOutlined />}
          onClick={() => setIsEditDrawerOpen(true)}
          className="rounded-lg! h-auto! py-2.5! px-5! border-primary! text-primary! hover:bg-primary/5! bg-transparent! font-inter! text-[14px]! font-medium!"
        >
          Edit Details
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Job Details */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 md:p-8 border-b border-outline-variant/20 bg-surface-container-low/30">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary font-inter text-[12px] font-semibold uppercase tracking-wider">
                    {job.category}
                  </span>
                  <h2 className="font-manrope text-[24px] md:text-[28px] font-semibold text-primary leading-tight">
                    {job.title}
                  </h2>
                  {job.created_at && (
                    <p className="font-inter text-[14px] text-on-surface-variant">
                      Posted on{" "}
                      {new Date(job.created_at).toLocaleDateString("en-NG", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-inter text-[12px] font-bold uppercase tracking-wider ${statusStyles.bg} ${statusStyles.text}`}
                >
                  {job.status?.replace("_", " ")}
                </span>
              </div>

              {/* Meta Pills */}
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  { icon: <WalletOutlined />, label: budgetLabel },
                  {
                    icon: <EnvironmentOutlined />,
                    label: job.state_code || job.lga_name || "Remote",
                  },
                  {
                    icon: <span>{urgencyConfig.icon}</span>,
                    label: urgencyConfig.label,
                  },
                  ...(job.preferred_date
                    ? [
                        {
                          icon: <CalendarOutlined />,
                          label: new Date(
                            job.preferred_date
                          ).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                          }),
                        },
                      ]
                    : []),
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[14px] bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/20"
                  >
                    <span className="text-on-surface-variant">{item.icon}</span>
                    <span className="font-inter font-medium text-on-surface">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 space-y-8">
              <div>
                <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                  Description
                </h4>
                <p className="font-inter text-[16px] text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Attachments */}
              {job.photo_urls && job.photo_urls?.length > 0 && (
                <div>
                  <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                    Attachments
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    <Image.PreviewGroup>
                      {job.photo_urls.map((url: string, idx: number) => (
                        <Image
                          key={idx}
                          src={url}
                          alt={`Attachment ${idx}`}
                          className="rounded-lg! aspect-square object-cover border border-outline-variant/20!"
                        />
                      ))}
                    </Image.PreviewGroup>
                  </div>
                </div>
              )}

              {/* Access Notes */}
              {job.access_notes && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-none">
                    <KeyOutlined className="text-primary text-[18px]" />
                  </div>
                  <div>
                    <h4 className="font-inter text-[14px] font-semibold text-primary mb-1">
                      Access & Instructions
                    </h4>
                    <p className="font-inter text-[14px] text-on-surface-variant leading-relaxed">
                      {job.access_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Custom Details */}
              {job.custom_details &&
                Object.keys(job.custom_details).length > 0 && (
                  <div>
                    <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                      Additional Details
                    </h4>
                    <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20 space-y-3">
                      {Object.entries(job.custom_details).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-[14px]"
                          >
                            <span className="text-on-surface-variant capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="text-on-surface font-medium text-right max-w-[60%]">
                              {String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quotes Inbox */}
        <div className="lg:col-span-1">
          <QuotesList
            quotes={quotes}
            jobId={jobId}
            onQuoteAction={refreshQuotes}
          />
        </div>
      </div>

      <EditJobDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        job={job}
        onUpdated={(updatedJob) => setJob(updatedJob)}
      />
    </div>
  );
}
