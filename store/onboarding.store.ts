import { create } from "zustand";

type OnboardingData = {
  fullName?: string;
  email?: string;
  profession?: string;
  skills?: string[];
  experience?: string;
  hourlyRate?: string;
  location?: string;
  bio?: string;
};

type OnboardingStore = {
  step: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 0,
  data: {},

  setStep: (step) => set({ step }),

  updateData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
}));
