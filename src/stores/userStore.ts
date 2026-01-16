import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserRole = "customer" | "staff";

interface UserState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      role: "customer",
      setRole: (role) => set({ role }),
    }),
    {
      name: "user-storage",
    }
  )
);
