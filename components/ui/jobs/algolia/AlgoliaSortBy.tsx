"use client";

import { useSortBy } from "react-instantsearch";
import { Select } from "antd";
import { ALGOLIA_INDICES } from "@/services/algolia/client";

const SORT_OPTIONS = [
  { value: ALGOLIA_INDICES.JOBS, label: "Relevance" },
  { value: "supabase_job_requests_created_desc", label: "Newest First" },
  { value: "supabase_job_requests_budget_desc", label: "Budget: High to Low" },
  { value: "supabase_job_requests_budget_asc", label: "Budget: Low to High" },
];

export default function AlgoliaSortBy() {
  const { currentRefinement, refine, options } = useSortBy({
    items: SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
  });

  return (
    <Select
      value={currentRefinement}
      onChange={refine}
      options={options}
      className="min-w-[140px]"
      popupClassName="rounded-lg!"
    />
  );
}
