"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { DownOutlined } from "@ant-design/icons";

export default function JobPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (currentPage >= totalPages) return null;

  return (
    <button
      onClick={() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (currentPage + 1).toString());
        router.push(`/dashboard/jobs?${params.toString()}`);
      }}
      className="flex items-center gap-2 px-8 py-3 rounded-full bg-surface-container-high text-primary font-inter text-[14px] font-medium hover:bg-primary/10 transition-all"
    >
      <DownOutlined /> Load More Listings
    </button>
  );
}
