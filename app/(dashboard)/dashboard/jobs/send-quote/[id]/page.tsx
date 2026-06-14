"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Skeleton, Button, Empty } from "antd";
import { ArrowLeftOutlined, WarningOutlined } from "@ant-design/icons";
import { JobListing } from "@/lib/jobs/types";
import { supabase } from "@/services/supabase/client";
import QuoteDetailView from "@/components/ui/quotes/QuoteDetailView";
import SendQuoteForm from "@/components/ui/quotes/SendQuoteForm";
import JobDetailSummary from "@/components/ui/quotes/JobDetailSummary";

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

  const [accessError, setAccessError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

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

      if (jobData.status !== "open") {
        setAccessError("This job is no longer accepting quotes");
        setLoadingJob(false);
        return;
      }
      if (jobData.customer_id === user.id) {
        setAccessError("You cannot send a quote to your own job");
        setLoadingJob(false);
        return;
      }

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

  if (loadingJob || loadingQuote) {
    return (
      // ✅ UPDATED: Full 1440px width with aligned padding
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto space-y-8">
        <Skeleton.Input active className="w-48 h-8 mb-4 rounded-lg!" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton.Button active className="!w-full !h-96 !rounded-2xl" />
          <Skeleton.Button
            active
            className="!w-full !h-96 !rounded-2xl lg:!col-span-2"
          />
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      // ✅ UPDATED: Full 1440px width with aligned padding
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
          <WarningOutlined className="text-error text-2xl" />
        </div>
        <h2 className="font-manrope text-[24px] font-semibold text-primary mb-2">
          Cannot Send Quote
        </h2>
        <p className="font-inter text-[16px] text-on-surface-variant mb-8 max-w-md">
          {accessError}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => router.back()}
            className="rounded-lg! h-auto! py-3! px-6! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
          >
            Go Back
          </Button>
          {job && (
            <Button
              type="primary"
              onClick={() => router.push(`/dashboard/jobs/${jobId}`)}
              className="rounded-lg! h-auto! py-3! px-6! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium!"
            >
              View Job Details
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      // ✅ UPDATED: Full 1440px width with aligned padding
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Empty
          description="Job Not Found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          type="primary"
          onClick={() => router.push("/dashboard/jobs")}
          className="mt-4 rounded-lg! bg-secondary! border-none!"
        >
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    // ✅ UPDATED: Full 1440px width with aligned padding
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-manrope text-[24px] md:text-[32px] font-semibold text-primary leading-tight">
            {myQuote && !isEditing ? "Quote Details" : "Send a Quote"}
          </h1>
          <p className="font-inter text-[16px] text-on-surface-variant mt-2">
            {myQuote && !isEditing
              ? "Review the proposal you sent to the client."
              : "Review the job details and submit your proposal."}
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          icon={<ArrowLeftOutlined />}
          className="rounded-lg! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! h-auto! py-2! px-4! font-inter! text-[14px]!"
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <JobDetailSummary job={job} />
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
