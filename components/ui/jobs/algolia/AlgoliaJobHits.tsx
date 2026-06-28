"use client";

import { useHits } from "react-instantsearch";
import { Skeleton, Empty } from "antd";
import JobCardWithCredits from "../JobCardWithCredits";
import type { AlgoliaJobRecord } from "@/services/algolia/client";
import type { JobListing } from "@/lib/jobs/types";

// Transform Algolia hit to JobListing format
function transformHitToJob(hit: AlgoliaJobRecord): JobListing {
  const firstPhoto = hit.photo_urls?.[0];

  return {
    id: hit.id,
    customer_id: hit.customer_id,
    category: hit.category as any,
    subcategory: hit.subcategory,
    description: hit.description,
    photo_urls: hit.photo_urls || [],
    address: null,
    service_type: "onsite" as any,
    access_notes: null,
    budget: hit.budget,
    urgency: hit.urgency as any,
    frequency: null,
    preferred_date: null,
    contact_methods: ["email"],
    custom_details: {},
    status: hit.status as any,
    expires_at: hit.expires_at,
    viewed_count: hit.viewed_count,
    quote_count: hit.quote_count,
    created_at: hit.created_at,
    updated_at: hit.created_at,
    lga_id: null,
    lga_name: hit.lga_name,
    state_code: null,
    city: hit.city,
    coordinates: hit._geoloc
      ? { lat: hit._geoloc.lat, lng: hit._geoloc.lng }
      : null,
    state: hit.state,
    title: hit.title,
    credit_cost: 10,
    location: null,
    source: "public_post" as any,
    target_artisan_id: null,
    // Computed fields
    first_photo_url: firstPhoto
      ? `http://dtdfvhgwcwtmifrmpgtf.supabase.co/storage/v1/object/public/job-photos/${firstPhoto}`
      : undefined,
    description_preview:
      hit.description.length > 120
        ? hit.description.slice(0, 120) + "..."
        : hit.description,
    is_expired: new Date(hit.expires_at) < new Date(),
    poster: hit.poster || {
      id: hit.customer_id,
      full_name: "Anonymous",
      avatar_url: "",
      username: "",
    },
  } as JobListing;
}

export default function AlgoliaJobHits() {
  const { hits, results } = useHits<AlgoliaJobRecord>();

  // Show loading skeleton while the initial search is loading
  if (!results) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            active
            className="bg-surface-container-lowest rounded-lg!"
          />
        ))}
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <Empty
        description="No jobs match your search"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {hits.map((hit) => {
        const job = transformHitToJob(hit);
        return <JobCardWithCredits key={hit.objectID} job={job} />;
      })}
    </section>
  );
}
