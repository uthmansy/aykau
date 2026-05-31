// components/jobs/JobClearFiltersButton.tsx
"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function JobClearFiltersButton() {
  const router = useRouter();

  return (
    <>
      <Button type="primary" onClick={() => router.push("/jobs")}>
        Clear Filters
      </Button>
      <Button className="ml-2" href="/post">
        Post a Request
      </Button>
    </>
  );
}
