import { supabase } from "@/services/supabase/client";
import { JobListing } from "../jobs/types";

export const fetchCreditCost = async (job: JobListing) => {
  try {
    const { data } = await supabase
      .from("job_credit_tiers")
      .select("credit_cost")
      .eq("budget_range_key", job.budget)
      .eq("is_active", true)
      .single();

    if (data) {
      return data.credit_cost;
    }
  } catch (error) {
    console.error("Error fetching credit cost:", error);
  }
};
