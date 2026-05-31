import { ServiceCategory } from "@/types/db";
import { create } from "zustand";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type CommunicationPref = "email" | "phone" | "whatsapp" | "in-app";

export type AddressPreference = "on-request" | "after-booking" | "landmark";

export type ResponseTime = "immediate" | "same-day" | "24-hours" | "flexible";

export type BudgetStyle = "fixed" | "hourly" | "negotiable" | "open";

export interface CustomerOnboardingData {
  // Basic Info
  avatar?: string | File;
  fullName?: string;
  email?: string;
  phone?: string;

  // About You
  bio?: string;
  serviceInterests?: ServiceCategory[];

  // Location
  state?: string;
  city?: string;
  postCode?: string;
  addressPreference?: AddressPreference;

  // Preferences
  communicationPrefs?: CommunicationPref[];
  responseTime?: ResponseTime;
  budgetStyle?: BudgetStyle;
}

export interface CustomerOnboardingStore {
  step: number;
  data: Partial<CustomerOnboardingData>;
  setStep: (step: number) => void;
  updateData: (data: Partial<CustomerOnboardingData>) => void;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

export const useCustomerOnboardingStore = create<CustomerOnboardingStore>(
  (set) => ({
    step: 0,
    data: {},

    setStep: (step) => set({ step }),

    updateData: (newData) =>
      set((state) => ({
        data: { ...state.data, ...newData },
      })),

    reset: () => set({ step: 0, data: {} }),
  })
);
