"use client";

import { useRefinementList } from "react-instantsearch";
import { Collapse, Checkbox } from "antd";
import { ServiceCategory } from "@/types/db";
import AlgoliaLocationFilter from "./AlgoliaLocationFilter";

const { Panel } = Collapse;

// Category options
const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: "home-services", label: "Home Services" },
  { value: "events", label: "Events" },
  { value: "wellness", label: "Wellness" },
  { value: "tech", label: "Tech" },
  { value: "creative", label: "Creative" },
  { value: "lessons", label: "Lessons" },
  { value: "automotive", label: "Automotive" },
  { value: "other", label: "Other" },
];

// Urgency options
const URGENCY_OPTIONS = [
  { value: "asap", label: "ASAP" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "planning", label: "Planning Ahead" },
];

function CategoryFilter() {
  const { items, refine } = useRefinementList({
    attribute: "category",
    limit: 20,
  });

  return (
    <div className="flex flex-col gap-2">
      {CATEGORY_OPTIONS.map((option) => {
        const item = items.find((i) => i.value === option.value);
        const count = item?.count || 0;
        const isSelected = item?.isRefined || false;

        return (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-low rounded-md px-2 py-1 transition-colors"
          >
            <Checkbox
              checked={isSelected}
              onChange={() => refine(option.value)}
            />
            <span className="font-inter text-[14px] text-on-surface-variant flex-1">
              {option.label}
            </span>
            {count > 0 && (
              <span className="font-inter text-[12px] text-outline">
                {count}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

function UrgencyFilter() {
  const { items, refine } = useRefinementList({
    attribute: "urgency",
    limit: 10,
  });

  return (
    <div className="flex flex-col gap-2">
      {URGENCY_OPTIONS.map((option) => {
        const item = items.find((i) => i.value === option.value);
        const count = item?.count || 0;
        const isSelected = item?.isRefined || false;

        return (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-low rounded-md px-2 py-1 transition-colors"
          >
            <Checkbox
              checked={isSelected}
              onChange={() => refine(option.value)}
            />
            <span className="font-inter text-[14px] text-on-surface-variant flex-1">
              {option.label}
            </span>
            {count > 0 && (
              <span className="font-inter text-[12px] text-outline">
                {count}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export default function AlgoliaSidebarFilters() {
  return (
    <div className="flex flex-col gap-4">
      {/* Location Filter (not collapsible) */}
      <AlgoliaLocationFilter />

      {/* Category & Urgency Filters */}
      <div className="bg-surface-container-lowest rounded-lg! p-4 shadow-[var(--shadow-level-1)]">
        <Collapse
          defaultActiveKey={["category", "urgency"]}
          ghost
          className="bg-transparent!"
          items={[
            {
              key: "category",
              label: (
                <span className="font-inter text-[14px] font-semibold text-on-surface uppercase tracking-wider">
                  Category
                </span>
              ),
              children: <CategoryFilter />,
            },
            {
              key: "urgency",
              label: (
                <span className="font-inter text-[14px] font-semibold text-on-surface uppercase tracking-wider">
                  Urgency
                </span>
              ),
              children: <UrgencyFilter />,
            },
          ]}
        />
      </div>
    </div>
  );
}
