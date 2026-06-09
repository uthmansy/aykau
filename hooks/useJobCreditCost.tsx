import { fetchCreditCost } from "@/lib/helpers/jobs";
import { JobListing } from "@/lib/jobs/types";
import { useEffect, useState } from "react";

function useJobCreditCost(job: JobListing | null): number {
  const [creditCost, setCreditCost] = useState<number>(0);

  useEffect(() => {
    // Ignore if job is null
    if (!job) {
      setCreditCost(0);
      return;
    }

    let isCancelled = false;

    const getCreditCost = async () => {
      try {
        const cost = await fetchCreditCost(job);
        if (!isCancelled) {
          setCreditCost(cost);
        }
      } catch (error) {
        // Handle error appropriately, e.g., log it or set an error state
        if (!isCancelled) {
          console.error("Failed to fetch credit cost:", error);
          // Optionally reset to 0 or keep previous valid value depending on requirements
          // setCreditCost(0);
        }
      }
    };

    getCreditCost();

    // Cleanup function to handle race conditions if job changes quickly
    return () => {
      isCancelled = true;
    };
  }, [job?.id]);

  return creditCost;
}

export default useJobCreditCost;
