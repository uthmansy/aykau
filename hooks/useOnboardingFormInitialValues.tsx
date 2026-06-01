import { supabase } from "@/services/supabase/client";
import { useEffect } from "react";

// Generic loader for both artisan & customer
export const useOnboardingFormInitialValues = (
  targetRole: "artisan" | "customer",
  store: any, // Your onboarding store
  form: any // Antd form instance
) => {
  useEffect(() => {
    const loadInitialValues = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch existing profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) return; // New user, no prefill needed

      // 1. Extract COMMON fields
      const commonFields = {
        fullName: profile.full_name,
        phone: profile.phone,
        nin: profile.nin,
        bio: profile.bio,
        postCode: profile.post_code,
        addressPreference: profile.address_preference,
        lgaId: profile.lga_id,
        lgaName: profile.lga_name,
        state: profile.state_code,
        city: profile.city,
        lgaCoordinates: profile.coordinates,
        avatarUrl: profile.avatar_url,
      };

      // 2. Extract ROLE-SPECIFIC fields
      const roleData =
        targetRole === "artisan" ? profile.artisan_data : profile.customer_data;

      // 3. Merge and hydrate store + form
      const initialValues = { ...commonFields, ...roleData };

      // Update store
      store.getState().updateData(initialValues);

      // Update form (Antd)
      form.setFieldsValue(initialValues);
    };

    loadInitialValues();
  }, [targetRole, store, form]);
};
