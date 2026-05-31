// lib/jobs/types.ts

import { JobRequests, ServiceCategory, UserProfile } from "@/types/db";

export interface JobListing extends JobRequests {
  // Computed fields (not in DB)
  first_photo_url?: string;
  description_preview: string;
  is_expired: boolean;
  poster: UserProfile;
}

export interface JobFilters {
  category?: ServiceCategory;
  subcategory?: string;
  location?: string;
  budget_min?: string;
  budget_max?: string;
  urgency?: string;
  search?: string;
  status?: "open" | "in_progress" | "completed";
}

export interface JobSort {
  field: "created_at" | "urgency" | "budget" | "quote_count";
  order: "asc" | "desc";
}
