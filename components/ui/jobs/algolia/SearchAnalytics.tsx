"use client";

import { useHits, useSearchBox } from "react-instantsearch";
import { useEffect, useRef } from "react";

/**
 * SearchAnalytics - Tracks search events for analytics
 *
 * This component monitors search activity and can be used to:
 * - Track zero-results searches
 * - Log popular search terms
 * - Measure search engagement
 *
 * To enable full Algolia Insights, integrate the `search-insights` library
 * and configure it in your Algolia dashboard.
 */
export default function SearchAnalytics() {
  const { results } = useHits();
  const { query } = useSearchBox();
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    // Track zero-results searches
    if (query && query !== lastQueryRef.current && results.nbHits === 0) {
      console.log("[Search Analytics] Zero results for:", query);

      // TODO: Send to your analytics service
      // Example: analytics.track('zero_results_search', { query })
    }

    // Track successful searches
    if (query && query !== lastQueryRef.current && results.nbHits > 0) {
      console.log(
        "[Search Analytics] Search:",
        query,
        "- Results:",
        results.nbHits
      );

      // TODO: Send to your analytics service
      // Example: analytics.track('search', { query, resultCount: results.nbHits })
    }

    lastQueryRef.current = query;
  }, [query, results]);

  // This component doesn't render anything
  return null;
}
