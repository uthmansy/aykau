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
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { JobListing } from "@/lib/jobs/types";
import QuotesList from "@/components/ui/jobs/manage/QuotesList";
import EditJobDrawer from "@/components/ui/jobs/manage/EditJobDrawer";

const { Title, Text } = Typography;

export default function ManageJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Fetch Job and Quotes
  useEffect(() => {
    async function fetchData() {
      if (!jobId) return;

      // 1. Fetch Job
      const { data: jobData } = await supabase
        .from("job_requests")
        .select(
          `*, poster:profiles!customer_id(full_name, username, avatar_url)`
        )
        .eq("id", jobId)
        .single();

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
  }, [jobId]);

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
      <div className="max-w-6xl mx-auto p-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            className="text-gray-500 mb-2"
          >
            Back
          </Button>
          <Title level={3} className="mb-1!">
            Manage Job
          </Title>
          <Text type="secondary">Review quotes and manage your job post.</Text>
        </div>
        <Button
          icon={<EditOutlined />}
          onClick={() => setIsEditDrawerOpen(true)}
        >
          Edit Job Details
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Job Summary */}
        <div className="lg:col-span-1">
          <Card className="rounded-xl shadow-sm sticky top-6">
            <Tag color="blue" className="mb-2">
              {job.category}
            </Tag>
            <Title level={4} className="mb-2!">
              {job.subcategory}
            </Title>
            <Divider className="my-3!" />
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Status:</strong>{" "}
                <Tag color={job.status === "open" ? "green" : "default"}>
                  {job.status}
                </Tag>
              </p>
              <p>
                <strong>Budget:</strong> {job.budget}
              </p>
              <p>
                <strong>Quotes Received:</strong>{" "}
                <span className="font-bold text-blue-600">{quotes.length}</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Right: Quotes List */}
        <div className="lg:col-span-2">
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
