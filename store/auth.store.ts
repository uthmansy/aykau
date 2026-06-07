// store/auth.store.ts
import { create } from "zustand";
import { User } from "@supabase/supabase-js"; // 🟢 Import Supabase User type

type AuthUser = User & {
  role?: "customer" | "artisan" | "admin"; // 🟢 Extend with role
};

type AuthState = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
