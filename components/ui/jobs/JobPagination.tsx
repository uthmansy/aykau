// components/jobs/JobPagination.tsx
"use client";

import { Pagination } from "antd";
import { useSearchParams, useRouter } from "next/navigation";

export default function JobPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Pagination
      current={currentPage}
      total={totalPages * 12} // Assuming 12 items per page
      pageSize={12}
      onChange={(newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/jobs?${params.toString()}`);
      }}
      showSizeChanger={false}
    />
  );
}
