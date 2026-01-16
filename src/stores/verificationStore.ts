import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VerificationState {
  isVerified: boolean;
  setVerified: (verified: boolean) => void;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      isVerified: false,
      setVerified: (verified) => set({ isVerified: verified }),
    }),
    {
      name: "verification-storage",
    }
  )
);
