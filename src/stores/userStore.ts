import { create } from "zustand";

type UserRole = "customer" | "staff";

interface UserState {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  role: "customer",
  setRole: (role) => set({ role }),
}));
