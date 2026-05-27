import { supabase } from "../supabase/client";

export const authService = {
  login: async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
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
    return supabase.auth.getUser();
  },

  getSession: async () => {
    return supabase.auth.getSession();
  },
};
