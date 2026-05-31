// lib/jobs/queries.ts
import { supabase } from "@/services/supabase/client";
import { JobFilters, JobSort, JobListing } from "./types";

const BUDGET_ORDER = {
  "under-10k": 1,
  "10k-50k": 2,
  "50k-100k": 3,
  "100k-500k": 4,
  "500k+": 5,
  flexible: 0,
};

const URGENCY_ORDER = {
  asap: 1,
  "this-week": 2,
  "this-month": 3,
  planning: 4,
};

export async function fetchJobs({
  filters = {},
  sort = { field: "created_at", order: "desc" },
  page = 1,
  limit = 12,
}: {
  filters?: JobFilters;
  sort?: JobSort;
  page?: number;
  limit?: number;
}) {
  let query = supabase
    .from("job_requests")
    .select(
      `*,
      poster:customer_id(*)
    `,
      { count: "exact" }
    )
    .eq("status", filters.status || "open");

  // 🔍 Full-text search (uses search_vector index)
  if (filters.search?.trim()) {
    query = query.textSearch("search_vector", filters.search.trim(), {
      type: "websearch",
      config: "english",
    });
  }

  // 🎯 Category filters
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.subcategory) {
    query = query.eq("subcategory", filters.subcategory);
  }

  // 📍 Location filter
  if (filters.location) {
    query = query.eq("service_location", filters.location);
  }

  // 💰 Budget range (simplified: filter by budget key)
  if (filters.budget_min || filters.budget_max) {
    // You could expand this to parse numeric ranges if storing numeric budgets
  }

  // ⏰ Urgency filter
  if (filters.urgency) {
    query = query.eq("urgency", filters.urgency);
  }

  // 🗓️ Exclude expired jobs
  query = query.gte("expires_at", new Date().toISOString());

  // 🔄 Sorting
  if (sort.field === "urgency") {
    // Custom sort by urgency priority
    query = query.order("urgency", {
      ascending: sort.order === "asc",
      nullsFirst: false,
    });
  } else if (sort.field === "budget") {
    // Custom sort by budget range priority
    query = query.order("budget", {
      ascending: sort.order === "asc",
      nullsFirst: false,
    });
  } else {
    // Default: created_at, quote_count
    query = query.order(sort.field, { ascending: sort.order === "asc" });
  }

  // 📄 Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  // ✨ Transform to JobListing with computed fields
  const jobs: JobListing[] = (data || []).map((job) => {
    const firstPhoto = job.photo_urls?.[0];
    return {
      ...job,
      // first_photo_url: firstPhoto ? getSignedUrlPath(firstPhoto) : undefined,
      first_photo_url: firstPhoto
        ? `http://dtdfvhgwcwtmifrmpgtf.supabase.co/storage/v1/object/public/job-photos/${firstPhoto}`
        : undefined,
      description_preview:
        job.description.length > 120
          ? job.description.slice(0, 120) + "..."
          : job.description,
      is_expired: new Date(job.expires_at) < new Date(),
      poster: job.poster,
    };
  });

  return {
    jobs,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

// Helper: Convert storage path to signed URL path (client will sign it)
function getSignedUrlPath(storagePath: string): string {
  return `/api/jobs/photos?path=${encodeURIComponent(storagePath)}`;
}

// 🔐 Fetch single job with RLS check
export async function fetchJobById(jobId: string) {
  const { data, error } = await supabase
    .from("job_requests")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    description_preview:
      data.description.length > 200
        ? data.description.slice(0, 200) + "..."
        : data.description,
    is_expired: new Date(data.expires_at) < new Date(),
  } as JobListing & { custom_details: Record<string, any> };
}
