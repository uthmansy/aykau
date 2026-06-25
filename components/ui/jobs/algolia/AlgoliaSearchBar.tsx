"use client";

import { useSearchBox, useMenu } from "react-instantsearch";
import { useState, useEffect, FormEvent } from "react";
import { Button } from "antd";
import { SearchOutlined, WalletOutlined } from "@ant-design/icons";

// Budget options matching the original design
const BUDGET_OPTIONS = [
  { value: "", label: "Any Budget" },
  { value: "under-10k", label: "Under ₦10k" },
  { value: "10k-50k", label: "₦10k – ₦50k" },
  { value: "50k-100k", label: "₦50k – ₦100k" },
  { value: "100k-500k", label: "₦100k – ₦500k" },
  { value: "500k+", label: "₦500k+" },
];

export default function AlgoliaSearchBar() {
  const { query, refine: setSearchQuery } = useSearchBox();
  const { items: budgetItems, refine: setBudgetFilter } = useMenu({
    attribute: "budget",
  });

  const [searchInput, setSearchInput] = useState(query);
  const [selectedBudget, setSelectedBudget] = useState("");

  // Sync input with Algolia query state
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleBudgetChange = (value: string) => {
    setSelectedBudget(value);
    setBudgetFilter(value);
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="bg-surface-glass! backdrop-blur-glass! p-2! rounded-full! shadow-[var(--shadow-level-1)]! border border-white/20! flex flex-wrap md:flex-nowrap items-center gap-2">
        {/* Search Input Area */}
        <div className="flex-1 flex items-center gap-3 px-6 py-2">
          <SearchOutlined className="text-outline text-[18px]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface placeholder:text-outline/60 font-inter text-[16px]"
            placeholder="Search by job title or keyword..."
          />
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-outline-variant/30 hidden md:block" />

        {/* Budget Dropdown */}
        <div className="flex items-center gap-2 px-4 py-2">
          <WalletOutlined className="text-outline text-[20px]" />
          <select
            value={selectedBudget}
            onChange={(e) => handleBudgetChange(e.target.value)}
            className="bg-transparent border-none focus:ring-0 focus:outline-none font-inter text-[14px] font-medium text-on-surface-variant cursor-pointer appearance-none"
          >
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Find Jobs Button */}
        <Button
          type="primary"
          htmlType="submit"
          className="rounded-full! px-8! h-auto! py-3! font-inter! text-[14px]! font-medium! shadow-md! hover:opacity-90! bg-primary!"
        >
          Find Jobs
        </Button>
      </div>
    </form>
  );
}
