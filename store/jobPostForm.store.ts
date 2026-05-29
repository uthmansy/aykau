import { JobPostData } from "@/components/ui/JobPostingForm";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JobPostStore {
  step: number;
  data: Partial<JobPostData>;
  setStep: (step: number) => void;
  updateData: (data: Partial<JobPostData>) => void;
  reset: () => void;
}

export const useJobPostStore = create<JobPostStore>()(
  persist(
    (set) => ({
      step: 0,
      data: {},
      setStep: (step) => set({ step }),
      updateData: (newData) =>
        set((state) => ({ data: { ...state.data, ...newData } })),
      reset: () => set({ step: 0, data: {} }),
    }),
    { name: "job-post-draft" } // localStorage key
  )
);
