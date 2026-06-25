"use client";

import { useStats } from "react-instantsearch";

export default function AlgoliaStats() {
  const { nbHits, processingTimeMS, query } = useStats();

  return (
    <p className="font-inter text-base text-on-surface-variant">
      {nbHits.toLocaleString()} open {nbHits === 1 ? "request" : "requests"}
      {query && (
        <span className="text-outline-variant">
          {" "}
          found in {processingTimeMS}ms
        </span>
      )}
    </p>
  );
}
