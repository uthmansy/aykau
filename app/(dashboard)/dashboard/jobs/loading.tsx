// app/(dashboard)/dashboard/jobs/loading.tsx
"use client";

import { Card, Skeleton } from "antd";

export default function JobsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton active title={{ width: "25%" }} paragraph={{ rows: 1 }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <div className="lg:w-64 shrink-0">
          <Card>
            <Skeleton active title={false} paragraph={{ rows: 10 }} />
          </Card>
        </div>

        {/* Jobs Grid */}
        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <div className="w-50 h-8 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeletonCSS key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Pure CSS skeleton - works with ANY Ant Design version
function JobCardSkeletonCSS() {
  return (
    <Card className="h-full" hoverable>
      {/* Image placeholder */}
      <div className="h-48 w-full bg-gray-200 rounded-t-lg mb-4 animate-pulse" />

      <Card.Meta
        avatar={
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        }
        title={<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />}
        description={
          <div className="space-y-3 mt-2">
            {/* Description lines */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap gap-2">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-14 animate-pulse" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        }
      />
    </Card>
  );
}
