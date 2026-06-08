// app/(dashboard)/dashboard/jobs/manage/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Skeleton,
  Result,
  Card,
  Tag,
  Space,
  Divider,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  WalletOutlined,
  CalendarOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store"; // 🟢 Added
import QuotesList from "@/components/ui/jobs/manage/QuotesList";
import EditJobDrawer from "@/components/ui/jobs/manage/EditJobDrawer";
import { JobListing } from "@/lib/jobs/types";

const { Title, Text, Paragraph } = Typography;

export default function ManageJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const userId = useAuthStore((state) => state.user?.id); // 🟢 Added

  const [job, setJob] = useState<JobListing | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false); // 🟢 Added

  // Fetch Job and Quotes
  useEffect(() => {
    async function fetchData() {
      if (!jobId || !userId) return;

      // 1. Fetch Job
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

      // 🟢 OWNERSHIP CHECK: Verify current user owns this job
      if (jobData.customer_id !== userId) {
        setIsUnauthorized(true);
        setLoading(false);
        return;
      }

      setJob(jobData);

      // 2. Fetch Quotes for this job
      const { data: quotesData } = await supabase
        .from("job_quotes")
        .select(
          `
          *, 
          artisan:profiles!artisan_id(full_name, username, avatar_url, is_verified)
        `
        )
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      setQuotes(quotesData || []);
      setLoading(false);
    }

    fetchData();
  }, [jobId, userId]);

  // Refresh quotes after an action is taken
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

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );

  // 🟢 UNAUTHORIZED: Show 403 Forbidden
  if (isUnauthorized)
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to manage this job."
        extra={
          <Button type="primary" onClick={() => router.push("/dashboard/jobs")}>
            Back to My Jobs
          </Button>
        }
      />
    );

  if (!job)
    return (
      <Result
        status="404"
        title="Job Not Found"
        extra={
          <Button onClick={() => router.push("/dashboard/jobs")}>Back</Button>
        }
      />
    );

  // --- Formatters ---
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

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <Title level={3} className="mb-0!">
            Manage Job Post
          </Title>
        </div>
        <Button
          icon={<EditOutlined />}
          onClick={() => setIsEditDrawerOpen(true)}
          className="rounded-lg"
        >
          Edit Details
        </Button>
      </div>

      {/* Main Grid: 2/3 for Details, 1/3 for Quotes Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Comprehensive Job Details (2/3 width) */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl shadow-sm border-gray-100 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Tag color="blue" className="mb-2 rounded-full px-3">
                    {job.category}
                  </Tag>
                  <Title level={3} className="mb-1! text-gray-900">
                    {job.title}
                  </Title>
                  {job.created_at && (
                    <Text type="secondary" className="text-sm">
                      Posted on{" "}
                      {new Date(job.created_at).toLocaleDateString("en-NG", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  )}
                </div>
                <Tag
                  color={job.status === "open" ? "green" : "default"}
                  className="rounded-full px-3 py-1"
                >
                  {job.status?.toUpperCase()}
                </Tag>
              </div>

              {/* Meta Pills */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <WalletOutlined className="text-gray-400" />
                  <span className="font-medium text-gray-700">
                    {budgetLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <EnvironmentOutlined className="text-gray-400" />
                  <span className="font-medium text-gray-700">
                    {job.state_code || job.lga_name || "Remote"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <span>{urgencyConfig.icon}</span>
                  <span className="font-medium text-gray-700">
                    {urgencyConfig.label}
                  </span>
                </div>
                {job.preferred_date && (
                  <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    <CalendarOutlined className="text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {new Date(job.preferred_date).toLocaleDateString(
                        "en-NG",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <Text
                strong
                className="block mb-2 text-xs uppercase text-gray-500 tracking-wide"
              >
                Description
              </Text>
              <Paragraph className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6! text-[15px]">
                {job.description}
              </Paragraph>

              {/* Attachments */}
              {job.photo_urls && job.photo_urls?.length > 0 && (
                <>
                  <Text
                    strong
                    className="block mb-3 text-xs uppercase text-gray-500 tracking-wide"
                  >
                    Attachments
                  </Text>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                    <Image.PreviewGroup>
                      {job.photo_urls.map((url: string, idx: number) => (
                        <Image
                          key={idx}
                          src={url}
                          alt={`Attachment ${idx}`}
                          className="rounded-lg aspect-square object-cover border border-gray-100"
                        />
                      ))}
                    </Image.PreviewGroup>
                  </div>
                </>
              )}

              {/* Access Notes */}
              {job.access_notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 mb-6">
                  <KeyOutlined className="text-amber-500 mt-1 text-lg" />
                  <div>
                    <Text strong className="block mb-1 text-sm text-amber-800">
                      Access & Instructions
                    </Text>
                    <Text className="text-sm text-amber-700 leading-relaxed">
                      {job.access_notes}
                    </Text>
                  </div>
                </div>
              )}

              {/* Custom Details */}
              {job.custom_details &&
                Object.keys(job.custom_details).length > 0 && (
                  <div>
                    <Text
                      strong
                      className="block mb-3 text-xs uppercase text-gray-500 tracking-wide"
                    >
                      Additional Details
                    </Text>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                      {Object.entries(job.custom_details).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-500 capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="text-gray-900 font-medium text-right max-w-[60%]">
                              {String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: WhatsApp-Style Quotes Inbox (1/3 width) */}
        <div className="lg:col-span-1">
          <QuotesList
            quotes={quotes}
            jobId={jobId}
            onQuoteAction={refreshQuotes}
          />
        </div>
      </div>

      {/* Edit Drawer */}
      <EditJobDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        job={job}
        onUpdated={(updatedJob) => setJob(updatedJob)}
      />
    </div>
  );
}
