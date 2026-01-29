import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VerificationState {
  isVerified: boolean;
  verificationCode: string | null;
  setVerified: (verified: boolean) => void;
  setVerificationCode: (code: string | null) => void;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      isVerified: false,
      verificationCode: null,
      setVerified: (verified) => set({ isVerified: verified }),
      setVerificationCode: (code) => set({ verificationCode: code }),
    }),
    {
      name: "verification-storage",
    }
  )
);
