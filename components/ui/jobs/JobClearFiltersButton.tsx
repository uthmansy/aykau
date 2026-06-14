"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function JobClearFiltersButton() {
  const router = useRouter();

  return (
    <div className="flex gap-3 justify-center mt-4">
      <Button
        type="primary"
        onClick={() => router.push("/jobs")}
        className="!rounded-full !px-6 !h-auto !py-2.5 !font-inter !text-[14px]"
      >
        Clear Filters
      </Button>
      <Button
        href="/post"
        className="!rounded-full !px-6 !h-auto !py-2.5 !font-inter !text-[14px] !border-primary !text-primary hover:!bg-primary/5"
      >
        Post a Request
      </Button>
    </div>
  );
}
