import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  duration: string;
  imageUrl?: string | null;
  category?: string | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      addItem: (item) =>
        set((state) => {
          // Check if already in cart
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [...state.items, item], isCartOpen: true };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
    }),
    {
      name: 'davinia-cart-storage',
    }
  )
);
