import { Suspense } from "react";
import { Skeleton, Empty } from "antd";
import { fetchJobs } from "@/lib/jobs/queries";
import { JobFilters as JobFiltersType, JobSort } from "@/lib/jobs/types";
import JobFilters from "@/components/ui/jobs/JobFilters";
import JobMobileFilters from "@/components/ui/jobs/JobMobileFilters"; // 🟢 New Import
import JobSearchBar from "@/components/ui/jobs/JobSearchBar";
import JobCardWithCredits from "@/components/ui/jobs/JobCardWithCredits";
import JobSortDropdown from "@/components/ui/jobs/JobSortDropdown";
import JobPagination from "@/components/ui/jobs/JobPagination";
import JobClearFiltersButton from "@/components/ui/jobs/JobClearFiltersButton";
import { ServiceCategory } from "@/types/db";

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
    budget?: string;
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
    budget: params.budget,
  };

  const filters: JobFiltersType = { ...initialFilters, status: "open" };
  const sort: JobSort = {
    field: (params.sort as JobSort["field"]) || "created_at",
    order: "desc",
  };

  const { jobs, pagination } = await fetchJobs({ filters, sort, page, limit });

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex gap-6">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col gap-6 w-[280px] shrink-0">
        <Suspense
          fallback={
            <Skeleton
              active
              className="bg-surface-container-lowest rounded-lg!"
            />
          }
        >
          <JobFilters initialFilters={initialFilters} />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-6">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className="font-manrope text-[32px] font-semibold text-primary leading-tight">
                Browse Open Jobs
              </h1>
              <p className="font-inter text-base text-on-surface-variant mt-2">
                {pagination.total} open{" "}
                {pagination.total === 1 ? "request" : "requests"}
              </p>
            </div>

            {/* 🟢 Mobile Controls Row */}
            <div className="flex items-center gap-2">
              <JobMobileFilters initialFilters={initialFilters} />
              <JobSortDropdown currentSort={params.sort} />
            </div>
          </div>

          <JobSearchBar />
        </header>

        {/* Job Feed */}
        <section className="flex flex-col gap-4">
          {jobs.length > 0 ? (
            <>
              {jobs.map((job) => (
                <JobCardWithCredits key={job.id} job={job} />
              ))}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center pt-8">
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
        </section>
      </div>
    </main>
  );
}
