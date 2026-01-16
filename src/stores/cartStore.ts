import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem, TimeSlot } from "@/types/product";

interface CartState {
  items: CartItem[];
  selectedTimeSlot: TimeSlot | null;
  orderDate: string | null;
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setTimeSlot: (slot: TimeSlot | null, date?: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedTimeSlot: null,
      orderDate: null,

      addItem: (product, quantity) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((item) => item.product.id !== productId) });
        } else {
          set({
            items: items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.product.id !== productId) });
      },

      clearCart: () => set({ items: [], selectedTimeSlot: null, orderDate: null }),

      setTimeSlot: (slot, date) => {
        const today = new Date().toISOString().split("T")[0];
        set({
          selectedTimeSlot: slot,
          orderDate: date || today
        });
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.product.pricePerMinOrder * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
