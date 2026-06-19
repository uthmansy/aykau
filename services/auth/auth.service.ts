import { supabase } from "../supabase/client";

export const authService = {
  login: async (email: string, password: string) => {
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !user) {
      return { data: null, error };
    }

    // 🟢 Fetch the user's role
    const { data: profileData } = await supabase
      .from("profiles")
      .select("current_active_role")
      .eq("id", user.id)
      .single();

    const userWithRole = {
      ...user,
      role: profileData?.current_active_role || "customer",
    };

    return { data: { user: userWithRole }, error: null };
  },

  register: async (
    email: string,
    password: string,
    fullName: string,
    role: "customer" | "artisan"
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error || !data.user) {
      return { data: null, error };
    }

    // Create profile with role
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      current_active_role: role,
      completed_onboarding_roles: [role],
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    return { data, error };
  },

  logout: async () => {
    return supabase.auth.signOut();
  },

  getUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { data: { user: null }, error };
    }

    // 🟢 Fetch the user's role from profiles table
    const { data: profileData } = await supabase
      .from("profiles")
      .select("current_active_role")
      .eq("id", user.id)
      .single();

    // 🟢 Merge role into user object
    const userWithRole = {
      ...user,
      role: profileData?.current_active_role || "customer",
    };

    return { data: { user: userWithRole }, error: null };
  },

  getSession: async () => {
    return supabase.auth.getSession();
  },

  // Google OAuth
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  // Password Reset
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });
    return { data, error };
  },

  // Email Verification
  resendVerification: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });
    return { data, error };
  },
};
