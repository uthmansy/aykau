/**
 * Algolia Index Configuration Script
 *
 * This script configures the job_requests index with optimal settings for:
 * - Geo-search and proximity ranking
 * - Faceted filtering (category, urgency, budget, location)
 * - Typo tolerance and relevance ranking
 *
 * Run with: npx tsx scripts/configure-algolia-index.ts
 */

import { algoliasearch } from "algoliasearch";

// Initialize Algolia client with admin API key
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
);

const INDEX_NAME = "supabase_job_requests";

async function configureIndex() {
  console.log(`Configuring Algolia index: ${INDEX_NAME}`);

  try {
    // Set index settings
    await client.setSettings({
      indexName: INDEX_NAME,
      indexSettings: {
        // Searchable attributes (ordered by importance)
        searchableAttributes: [
          "title",
          "subcategory",
          "description",
          "category",
        ],

        // Attributes for faceting (filters)
        attributesForFaceting: [
          "searchable(category)",
          "searchable(subcategory)",
          "searchable(urgency)",
          "searchable(state)",
          "searchable(lga_name)",
          "searchable(budget)",
          "status",
          "source",
        ],

        // Attributes to retrieve in search results
        attributesToRetrieve: [
          "id",
          "title",
          "description",
          "category",
          "subcategory",
          "budget",
          "urgency",
          "status",
          "photo_urls",
          "state",
          "city",
          "lga_name",
          "created_at",
          "expires_at",
          "customer_id",
          "quote_count",
          "viewed_count",
          "_geoloc",
          "poster",
        ],

        // Attributes to highlight in search results
        attributesToHighlight: ["title", "description", "subcategory"],

        // Ranking formula (order matters)
        ranking: [
          "geo", // Proximity ranking (distance)
          "typo", // Typo tolerance
          "words", // Number of matched words
          "filters", // Filter match
          "proximity", // Word proximity
          "attribute", // Attribute importance
          "exact", // Exact match
          "custom", // Custom ranking
        ],

        // Custom ranking (when all else is equal)
        customRanking: [
          "desc(created_at)", // Newer jobs first
          "desc(quote_count)", // Popular jobs first
        ],

        // Pagination
        hitsPerPage: 12,
        paginationLimitedTo: 1000,

        // Typo tolerance
        typoTolerance: "min",

        // Allow typos on numeric tokens (useful for budget searches)
        allowTyposOnNumericTokens: true,

        // Query rules
        enableRules: true,

        // Enable personalization (optional)
        enablePersonalization: false,

        // Snippet configuration
        attributesToSnippet: ["description:120"],
        snippetEllipsisText: "...",

        // Highlight configuration
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",

        // Remove stop words for better search
        removeStopWords: true,

        // Advanced features
        advancedSyntax: true,
        optionalWords: ["service", "request", "job"],
      },
    });

    console.log("✓ Index settings configured successfully");

    // Create virtual indices for sorting
    const virtualIndices = [
      {
        name: "job_requests_created_desc",
        ranking: ["desc(created_at)", "geo", "typo", "words"],
      },
      {
        name: "job_requests_budget_desc",
        ranking: ["desc(budget)", "geo", "typo", "words"],
      },
      {
        name: "job_requests_budget_asc",
        ranking: ["asc(budget)", "geo", "typo", "words"],
      },
    ];

    for (const virtualIndex of virtualIndices) {
      await client.setSettings({
        indexName: virtualIndex.name,
        indexSettings: {
          ranking: virtualIndex.ranking,
          searchableAttributes: [
            "title",
            "subcategory",
            "description",
            "category",
          ],
          attributesForFaceting: [
            "searchable(category)",
            "searchable(subcategory)",
            "searchable(urgency)",
            "searchable(state)",
            "searchable(lga_name)",
            "searchable(budget)",
            "status",
            "source",
          ],
          attributesToRetrieve: [
            "id",
            "title",
            "description",
            "category",
            "subcategory",
            "budget",
            "urgency",
            "status",
            "photo_urls",
            "state",
            "city",
            "lga_name",
            "created_at",
            "expires_at",
            "customer_id",
            "quote_count",
            "viewed_count",
            "_geoloc",
            "poster",
          ],
        },
      });
      console.log(`✓ Virtual index created: ${virtualIndex.name}`);
    }

    console.log("\n✅ All indices configured successfully!");
    console.log("\nNext steps:");
    console.log(
      "1. Ensure your Supabase integration is syncing data to the job_requests index"
    );
    console.log(
      "2. Verify that the _geoloc field is being populated from the coordinates column"
    );
    console.log("3. Test the search functionality in your application");
  } catch (error) {
    console.error("❌ Error configuring index:", error);
    process.exit(1);
  }
}

// Run the configuration
configureIndex();
