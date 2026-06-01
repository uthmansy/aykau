import { getLgaCoordinates } from "@/lib/helpers/location";
import { create } from "zustand";

export type OnboardingData = {
  fullName?: string;
  email?: string;
  phone?: string;
  profession?: string;
  skills?: string[];
  experience?: string;
  hourlyRate?: string;
  location?: string;
  bio?: string;
  state?: string; // State name or code
  lgaId?: number; // Selected LGA ID
  lgaName?: string; // Selected LGA name (for display)
  lgaCoordinates?: {
    // Auto-populated when LGA selected
    lat: number;
    lng: number;
  };
  postCode?: string;
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
