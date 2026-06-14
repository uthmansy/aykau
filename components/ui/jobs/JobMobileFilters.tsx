"use client";

import { useState } from "react";
import { Drawer, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import JobFilters from "./JobFilters";
import { JobFilters as JobFiltersType } from "@/lib/jobs/types";

interface Props {
  initialFilters: Partial<JobFiltersType>;
}

export default function JobMobileFilters({ initialFilters }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setOpen(true)}
        // ✅ FIX: Added `!` to `flex` and `lg:hidden` to override AntD's default CSS-in-JS display properties
        className="flex! lg:hidden! rounded-lg! border-outline-variant! text-on-surface-variant! items-center! gap-2! h-auto! py-1.5! px-3!"
      >
        <FilterOutlined className="text-[16px]" /> Filters
      </Button>

      {/* Bottom Sheet Drawer */}
      <Drawer
        placement="bottom"
        height="90vh"
        onClose={() => setOpen(false)}
        open={open}
        className="mobile-filter-drawer"
        styles={{
          body: {
            padding: 0,
            backgroundColor: "var(--surface-container-lowest)",
          },
          header: { display: "none" },
          wrapper: { borderRadius: "16px 16px 0 0", overflow: "hidden" },
        }}
      >
        <JobFilters
          initialFilters={initialFilters}
          mobile
          onClose={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
