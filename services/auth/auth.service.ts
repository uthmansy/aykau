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

  register: async (email: string, password: string) => {
    return supabase.auth.signUp({
      email,
      password,
    });
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
};
