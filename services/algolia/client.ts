import { liteClient as algoliasearch } from "algoliasearch/lite";

// Initialize Algolia search client with lite version (search-only)
export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

// Algolia index names
export const ALGOLIA_INDICES = {
  JOBS: "supabase_job_requests",
} as const;

// Type for job record from Algolia
export interface AlgoliaJobRecord {
  objectID: string;
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: string;
  urgency: string;
  status: string;
  photo_urls: string[];
  state: string;
  city: string;
  lga_name: string;
  created_at: string;
  expires_at: string;
  customer_id: string;
  quote_count: number;
  viewed_count: number;
  _geoloc?: {
    lat: number;
    lng: number;
  };
  // Poster profile data (if included in index)
  poster?: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
}
