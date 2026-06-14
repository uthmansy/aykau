"use client";

import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

// Define specific types for better type safety
type JobStatus = "open" | "in_progress" | "completed" | "closed" | string;

interface Job {
  title: string;
  created_at: string;
  location?: string;
  status: JobStatus;
  budget: string;
  urgency?: string;
  subcategory?: string;
  description?: string;
  [key: string]: any; // Allow other dynamic fields if necessary
}

interface Props {
  job: Job;
}

export default function JobInfoCard({ job }: Props) {
  const formatBudget = (budgetKey: string) => {
    const map: Record<string, string> = {
      "under-10k": "Under ₦10,000",
      "10k-50k": "₦10,000 - ₦50,000",
      "50k-100k": "₦50,000 - ₦100,000",
      "100k-500k": "₦100,000 - ₦500,000",
      "500k+": "₦500,000+",
      flexible: "Flexible / Get Quotes",
    };
    return map[budgetKey] || budgetKey;
  };

  // Define the config object with a clear type
  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    open: {
      label: "Open",
      bg: "bg-success-emerald/10",
      text: "text-success-emerald",
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-primary/10",
      text: "text-primary",
    },
    completed: {
      label: "Completed",
      bg: "bg-on-surface-variant/10",
      text: "text-on-surface-variant",
    },
    closed: { label: "Closed", bg: "bg-error/10", text: "text-error" },
  };

  // Use optional chaining and fallback safely
  const currentStatusConfig = statusConfig[job.status] || {
    label: job.status,
    bg: "bg-on-surface-variant/10",
    text: "text-on-surface-variant",
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1 space-y-3">
          <h1 className="font-manrope text-[24px] md:text-[32px] font-semibold text-primary leading-tight">
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 font-inter text-[14px] text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <CalendarOutlined className="text-outline" />
              Posted{" "}
              {new Date(job.created_at).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {job.location && (
              <span className="flex items-center gap-1.5">
                <EnvironmentOutlined className="text-outline" />
                {job.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3">
          <span
            className={`px-3 py-1 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider ${currentStatusConfig.bg} ${currentStatusConfig.text}`}
          >
            {currentStatusConfig.label}
          </span>
          <div className="text-right">
            <p className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
              Budget
            </p>
            <p className="font-manrope text-[24px] font-semibold text-primary">
              {formatBudget(job.budget)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-outline-variant/30" />

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {job.urgency && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-none">
              <ClockCircleOutlined className="text-primary text-[18px]" />
            </div>
            <div>
              <p className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                Urgency
              </p>
              <p className="font-inter text-[16px] font-medium text-on-surface capitalize">
                {job.urgency?.replace("-", " ")}
              </p>
            </div>
          </div>
        )}
        {job.subcategory && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-none">
              <AppstoreOutlined className="text-primary text-[18px]" />
            </div>
            <div>
              <p className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                Category
              </p>
              <p className="font-inter text-[16px] font-medium text-on-surface">
                {job.subcategory}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-outline-variant/30" />

      {/* Description */}
      <div>
        <h3 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Job Description
        </h3>
        <p className="font-inter text-[16px] text-on-surface-variant leading-relaxed whitespace-pre-wrap">
          {job.description}
        </p>
      </div>
    </div>
  );
}
