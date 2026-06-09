// app/jobs/page.tsx
import { Suspense } from "react";
import { Grid, Skeleton, Empty } from "antd";
import { fetchJobs } from "@/lib/jobs/queries";
import { JobFilters as JobFiltersType, JobSort } from "@/lib/jobs/types";
import JobFilters from "@/components/ui/jobs/JobFilters";
import JobCardWithCredits from "@/components/ui/jobs/JobCardWithCredits"; // 🟢 Changed
import JobSortDropdown from "@/components/ui/jobs/JobSortDropdown";
import JobPagination from "@/components/ui/jobs/JobPagination";
import JobClearFiltersButton from "@/components/ui/jobs/JobClearFiltersButton";
import { ServiceCategory } from "@/types/db";

const { useBreakpoint } = Grid;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    location?: string;
    urgency?: string;
    search?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 12;

  const initialFilters = {
    category: params.category as ServiceCategory,
    location: params.location,
    urgency: params.urgency,
    search: params.search,
  };

  const filters: JobFiltersType = {
    ...initialFilters,
    status: "open",
  };

  const sort: JobSort = {
    field: (params.sort as JobSort["field"]) || "created_at",
    order: "desc",
  };

  const { jobs, pagination } = await fetchJobs({ filters, sort, page, limit });

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Services</h1>
        <p className="text-gray-600">
          {pagination.total} open{" "}
          {pagination.total === 1 ? "request" : "requests"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 shrink-0">
          <Suspense fallback={<Skeleton active />}>
            <JobFilters initialFilters={initialFilters} />
          </Suspense>
        </div>

        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <JobSortDropdown currentSort={params.sort} />
          </div>

          {jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCardWithCredits key={job.id} job={job} /> // 🟢 Changed
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <JobPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty
              description="No jobs match your filters"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <JobClearFiltersButton />
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}
