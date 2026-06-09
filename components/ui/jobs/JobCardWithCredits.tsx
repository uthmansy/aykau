// components/ui/jobs/JobCardWithCredits.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import JobCard from "./JobCard";
import { JobListing } from "@/lib/jobs/types";
import useJobCreditCost from "@/hooks/useJobCreditCost"; // 🟢 Import hook

interface Props {
  job: JobListing;
  showActions?: boolean;
  variant?: "default" | "compact";
}

export default function JobCardWithCredits({
  job,
  showActions,
  variant,
}: Props) {
  const userId = useAuthStore((state) => state.user?.id);
  const userRole = useAuthStore((state) => state.user?.role);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const creditCost = useJobCreditCost(job); // 🟢 Use hook

  useEffect(() => {
    if (userId && userRole === "artisan" && job.customer_id !== userId) {
      checkUnlockStatus();
    }
  }, [userId, job.id, userRole, job.customer_id]);

  const checkUnlockStatus = async () => {
    try {
      const { data } = await supabase
        .from("unlocked_jobs")
        .select("id")
        .eq("job_id", job.id)
        .eq("artisan_id", userId)
        .eq("is_refunded", false)
        .maybeSingle();

      setIsUnlocked(!!data);
    } catch (error) {
      console.error("Error checking unlock status:", error);
    }
  };

  return (
    <JobCard
      job={job}
      showActions={showActions}
      variant={variant}
      isUnlocked={isUnlocked}
      creditCost={creditCost}
      isArtisanViewer={userRole === "artisan" && job.customer_id !== userId}
    />
  );
}
