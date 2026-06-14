"use client";

import { Select } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { SortAscendingOutlined } from "@ant-design/icons";

export default function JobSortDropdown({
  currentSort,
}: {
  currentSort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    // ✅ Changed to rounded-lg (8px) and reduced vertical padding (py-1.5)
    <div className="flex items-center gap-2 px-5 py-0.5 rounded-full border border-outline-variant  transition-all">
      <SortAscendingOutlined className="text-on-surface-variant text-[16px]" />
      <Select
        value={currentSort || "created_at"}
        variant="borderless"
        className="w-auto! min-w-[100px] text-[14px]!"
        onChange={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", value);
          params.set("page", "1");
          router.push(`/jobs?${params.toString()}`);
        }}
        options={[
          { value: "created_at", label: "Newest" },
          { value: "urgency", label: "Most Urgent" },
          { value: "budget", label: "Highest Budget" },
          { value: "quote_count", label: "Most Quotes" },
        ]}
      />
    </div>
  );
}
