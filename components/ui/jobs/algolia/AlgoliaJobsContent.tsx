"use client";

import { Suspense } from "react";
import { Skeleton } from "antd";
import { InstantSearch, Configure } from "react-instantsearch";
import { searchClient, ALGOLIA_INDICES } from "@/services/algolia/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import AlgoliaSidebarFilters from "./AlgoliaSidebarFilters";
import AlgoliaSearchBar from "./AlgoliaSearchBar";
import AlgoliaJobHits from "./AlgoliaJobHits";
import AlgoliaPagination from "./AlgoliaPagination";
import AlgoliaStats from "./AlgoliaStats";
import AlgoliaCurrentRefinements from "./AlgoliaCurrentRefinements";
import AlgoliaSortBy from "./AlgoliaSortBy";
import SearchAnalytics from "./SearchAnalytics";

export default function AlgoliaJobsContent() {
  const { location } = useGeolocation();

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={ALGOLIA_INDICES.JOBS}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Configure
        hitsPerPage={12}
        aroundLatLng={location ? `${location.lat}, ${location.lng}` : undefined}
        aroundRadius="all"
        filters="status:open AND source:public_post"
      />

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
            <AlgoliaSidebarFilters />
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
              </div>
            </div>
          </header>

          {/* Search Bar */}
          <AlgoliaSearchBar />

          {/* Stats and Sort Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <AlgoliaStats />
            <div className="flex items-center gap-4">
              <AlgoliaCurrentRefinements />
              <AlgoliaSortBy />
            </div>
          </div>

          {/* Job Results */}
          <AlgoliaJobHits />

          {/* Pagination */}
          <AlgoliaPagination />

          {/* Search Analytics */}
          <SearchAnalytics />
        </div>
      </main>
    </InstantSearch>
  );
}
