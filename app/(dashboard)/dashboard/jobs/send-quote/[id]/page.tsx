"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Button, Typography, Skeleton, Result } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
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

  // New states for managing the existing quote
  const [myQuote, setMyQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const jobId = params.id as string;

  // 1. Fetch Job Details
  useEffect(() => {
    async function fetchJob() {
      if (!jobId) return;
      const { data, error } = await supabase
        .from("job_requests")
        .select(
          `*, poster:profiles!customer_id(full_name, username, avatar_url, is_verified)`
        )
        .eq("id", jobId)
        .single();

      if (error || !data) setJob(null);
      else setJob(data as any);
      setLoadingJob(false);
    }
    fetchJob();
  }, [jobId, supabase]);

  // 2. Fetch Current User's Quote for this Job
  useEffect(() => {
    async function fetchQuote() {
      if (!jobId) return;

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
        .maybeSingle(); // maybeSingle prevents errors if no record exists

      setMyQuote(data);
      setLoadingQuote(false);
    }
    fetchQuote();
  }, [jobId, supabase]);

  // 3. Pre-fill form when entering Edit mode
  useEffect(() => {
    if (myQuote && isEditing) {
      form.setFieldsValue({
        message: myQuote.message,
        quoted_price: myQuote.quoted_price,
        quoted_price_note: myQuote.quoted_price_note,
        availability_note: myQuote.availability_note,
        // Convert Postgres array back to newline-separated string for the textarea
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
        {/* Left Column: Job Details Summary (Unchanged) */}
        <JobDetailSummary job={job} />

        {/* Right Column: Conditionally Render Form or Read-Only View */}
        <div className="lg:col-span-2">
          {myQuote && !isEditing ? (
            // STATE 2 & 3: Show Read-Only View
            <QuoteDetailView myQuote={myQuote} setIsEditing={setIsEditing} />
          ) : (
            // STATE 1: Show Form (Empty or Pre-filled for Editing)
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
