import { supabase } from "@/services/supabase/client";

export const appendOnboardingRole = async (
  userId: string,
  newRole: "artisan" | "customer"
) => {
  // 1. Fetch current profile
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("completed_onboarding_roles, current_active_role")
    .eq("id", userId)
    .single();

  // PGRST116 = "not found" error → treat as new user
  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  // 2. Merge roles safely (no duplicates)
  const existingRoles = profile?.completed_onboarding_roles || [];
  const updatedRoles = existingRoles.includes(newRole)
    ? existingRoles
    : [...existingRoles, newRole];

  // 3. Return payload for upsert
  return {
    completed_onboarding_roles: updatedRoles,
    current_active_role: newRole,
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
