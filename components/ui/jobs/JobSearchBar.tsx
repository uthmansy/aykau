"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "antd";
import { SearchOutlined, WalletOutlined } from "@ant-design/icons";

export default function JobSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [budget, setBudget] = useState(searchParams.get("budget") || "");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (budget) params.set("budget", budget);
    else params.delete("budget");

    params.set("page", "1");
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    // Uses bg-surface-glass and backdrop-blur-glass to match the HTML's .glass-card
    <div className="bg-surface-glass! backdrop-blur-glass! p-2! rounded-full! shadow-[var(--shadow-level-1)]! border border-white/20! flex flex-wrap md:flex-nowrap items-center gap-2">
      {/* Search Input Area */}
      <div className="flex-1 flex items-center gap-3 px-6 py-2">
        <SearchOutlined className="text-outline text-[18px]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="bg-transparent border-none focus:ring-0 focus:outline-none font-inter text-[14px] font-medium text-on-surface-variant cursor-pointer appearance-none"
        >
          <option value="">Any Budget</option>
          <option value="under-10k">Under ₦10k</option>
          <option value="10k-50k">₦10k – ₦50k</option>
          <option value="50k-100k">₦50k – ₦100k</option>
          <option value="100k-500k">₦100k – ₦500k</option>
          <option value="500k+">₦500k+</option>
        </select>
      </div>

      {/* Find Jobs Button (Primary Action = Secondary/Orange per DESIGN.md) */}
      <Button
        type="primary"
        onClick={handleSearch}
        className="rounded-full! px-8! h-auto! py-3! font-inter! text-[14px]! font-medium! shadow-md! hover:opacity-90! bg-primary!"
      >
        Find Jobs
      </Button>
    </div>
  );
}
