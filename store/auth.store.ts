import { create } from "zustand";

type AuthUser = {
  id: string;
  email?: string;
} | null;

type AuthState = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),
}));
