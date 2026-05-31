// components/jobs/JobSortDropdown.tsx
"use client";

import { Select } from "antd";
import { useSearchParams, useRouter } from "next/navigation";

export default function JobSortDropdown({
  currentSort,
}: {
  currentSort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      defaultValue={currentSort || "created_at"}
      style={{ width: 200 }}
      onChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        params.set("page", "1"); // Reset to page 1 on sort change
        router.push(`/jobs?${params.toString()}`);
      }}
      options={[
        { value: "created_at", label: "🕐 Newest First" },
        { value: "urgency", label: "🔥 Most Urgent" },
        { value: "budget", label: "💰 Highest Budget" },
        { value: "quote_count", label: "💬 Most Quotes" },
      ]}
    />
  );
}
