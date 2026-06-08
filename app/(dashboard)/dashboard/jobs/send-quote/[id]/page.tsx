// app/(dashboard)/dashboard/jobs/send-quote/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Button, Typography, Skeleton, Result } from "antd";
import { ArrowLeftOutlined, WarningOutlined } from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import { supabase } from "@/services/supabase/client";
import QuoteDetailView from "@/components/ui/quotes/QuoteDetailView";
import SendQuoteForm from "@/components/ui/quotes/SendQuoteForm";
import JobDetailSummary from "@/components/ui/quotes/JobDetailSummary";

const { Title, Text } = Typography;

export default function SendQuotePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();

  const [job, setJob] = useState<JobListing | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [myQuote, setMyQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const jobId = params.id as string;

  // 🟢 NEW: Security check states
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // 1. Fetch Job Details + Security Checks
  useEffect(() => {
    async function fetchJobAndCheckAccess() {
      if (!jobId) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAccessError("You must be logged in to send quotes");
        setLoadingJob(false);
        return;
      }

      // Fetch job
      const { data: jobData, error: jobError } = await supabase
        .from("job_requests")
        .select(
          `*, poster:profiles!customer_id(full_name, username, avatar_url, is_verified)`
        )
        .eq("id", jobId)
        .single();

      if (jobError || !jobData) {
        setJob(null);
        setLoadingJob(false);
        return;
      }

      setJob(jobData as any);

      // 🟢 CHECK 1: Job must be open
      if (jobData.status !== "open") {
        setAccessError("This job is no longer accepting quotes");
        setLoadingJob(false);
        return;
      }

      // 🟢 CHECK 2: Artisan cannot quote on their own job
      if (jobData.customer_id === user.id) {
        setAccessError("You cannot send a quote to your own job");
        setLoadingJob(false);
        return;
      }

      // 🟢 CHECK 3: Artisan must have unlocked the job
      const { data: unlockData } = await supabase
        .from("unlocked_jobs")
        .select("id")
        .eq("job_id", jobId)
        .eq("artisan_id", user.id)
        .eq("is_refunded", false)
        .maybeSingle();

      if (!unlockData) {
        setAccessError("You must unlock this job before sending a quote");
        setLoadingJob(false);
        return;
      }

      setIsUnlocked(true);
      setLoadingJob(false);
    }

    fetchJobAndCheckAccess();
  }, [jobId]);

  // 2. Fetch Current User's Quote for this Job
  useEffect(() => {
    async function fetchQuote() {
      if (!jobId || !isUnlocked) {
        setLoadingQuote(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingQuote(false);
        return;
      }

      const { data } = await supabase
        .from("job_quotes")
        .select("*")
        .eq("job_id", jobId)
        .eq("artisan_id", user.id)
        .maybeSingle();

      setMyQuote(data);
      setLoadingQuote(false);
    }
    fetchQuote();
  }, [jobId, isUnlocked]);

  // 3. Pre-fill form when entering Edit mode
  useEffect(() => {
    if (myQuote && isEditing) {
      form.setFieldsValue({
        message: myQuote.message,
        quoted_price: myQuote.quoted_price,
        quoted_price_note: myQuote.quoted_price_note,
        availability_note: myQuote.availability_note,
        portfolio_links: myQuote.portfolio_links?.join("\n") || "",
      });
    } else if (!myQuote) {
      form.resetFields();
    }
  }, [myQuote, isEditing, form]);

  // --- UI States ---
  if (loadingJob || loadingQuote) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  // 🟢 NEW: Show access error
  if (accessError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Result
          icon={<WarningOutlined className="text-amber-500" />}
          title="Cannot Send Quote"
          subTitle={accessError}
          extra={
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.back()}>Go Back</Button>
              {job && (
                <Button
                  type="primary"
                  onClick={() => router.push(`/dashboard/jobs/${jobId}`)}
                  className="bg-gray-900 hover:bg-gray-800 border-0"
                >
                  View Job Details
                </Button>
              )}
            </div>
          }
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Result
          status="404"
          title="Job Not Found"
          subTitle="The job you are trying to quote for does not exist or has been removed."
          extra={
            <Button
              type="primary"
              onClick={() => router.push("/dashboard/jobs")}
            >
              Back to Jobs
            </Button>
          }
        />
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <Title level={4} className="mb-1! text-gray-900!">
          {myQuote && !isEditing ? "Quote Details" : "Send a Quote"}
        </Title>
        <Text type="secondary">
          {myQuote && !isEditing
            ? "Review the proposal you sent to the client."
            : "Review the job details and submit your proposal."}
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Details Summary */}
        <JobDetailSummary job={job} />

        {/* Right Column: Conditionally Render Form or Read-Only View */}
        <div className="lg:col-span-2">
          {myQuote && !isEditing ? (
            <QuoteDetailView myQuote={myQuote} setIsEditing={setIsEditing} />
          ) : (
            <SendQuoteForm
              jobId={jobId}
              myQuote={myQuote}
              setIsEditing={setIsEditing}
              setMyQuote={setMyQuote}
              form={form}
            />
          )}
        </div>
      </div>
    </div>
  );
}
