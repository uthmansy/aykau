import { getLgaCoordinates } from "@/lib/helpers/location";
import { ServiceCategory } from "@/types/db";
import { create } from "zustand";
import { OnboardingData } from "./artisanOnboarding.store";

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
  lgaId?: number; // Selected LGA ID
  lgaName?: string; // LGA name for display
  city?: string; // Optional city/area text
  lgaCoordinates?: {
    // Auto-populated from LGA
    lat: number;
    lng: number;
  };

  postCode?: string;
  addressPreference?: "on-request" | "after-booking" | "landmark";

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

    updateData: (newData: Partial<CustomerOnboardingData>) => {
      set((state) => {
        // If LGA changed, auto-fetch coordinates
        if (newData.lgaId && newData.lgaId !== state.data.lgaId) {
          const coords = getLgaCoordinates(newData.lgaId);
          if (coords) {
            newData.lgaCoordinates = coords;
          }
        }
        return { data: { ...state.data, ...newData } };
      });
    },

    reset: () => set({ step: 0, data: {} }),
  })
);
