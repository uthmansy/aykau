import { getLgaCoordinates } from "@/lib/helpers/location";
import { create } from "zustand";

export type OnboardingData = {
  // 🔹 Common (both flows)
  fullName?: string;
  avatar?: string | File;
  phone?: string;
  nin?: string;
  bio?: string;
  postCode?: string;
  addressPreference?: string;
  lgaId?: number;
  lgaName?: string;
  state?: string;
  city?: string;
  lgaCoordinates?: { lat: number; lng: number };
  preferredSubcategories?: string[];

  // 🔹 Artisan-only
  professions?: string[];
  skills?: string[];
  experience?: string;
  hourlyRate?: number;

  // 🔹 Customer-only
  serviceInterests?: string[];
  responseTime?: string;
  budgetStyle?: string;
  communicationPrefs?: string[];
};

type OnboardingStore = {
  step: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
};

export const useArtisanOnboardingStore = create<OnboardingStore>((set) => ({
  step: 0,
  data: {},

  setStep: (step) => set({ step }),

  updateData: (newData: Partial<OnboardingData>) => {
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
}));
