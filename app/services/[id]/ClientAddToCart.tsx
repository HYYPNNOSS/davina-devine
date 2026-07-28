"use client";

import { useCartStore } from "../../store/cartStore";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

export default function ClientAddToCart({ service }: { service: any }) {
  const { addItem, items } = useCartStore();
  const [added, setAdded] = useState(false);

  const isInCart = items.some(i => i.id === service.id);

  const handleAdd = () => {
    if (isInCart) return;
    addItem(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd}
      disabled={isInCart}
      className={`w-full md:w-auto inline-flex items-center justify-center gap-[10px] px-[33px] py-[18px] rounded-[5px] font-medium text-[15px] transition-all duration-300 ${
        isInCart 
          ? "bg-[var(--color-stone)] text-white/50 cursor-not-allowed" 
          : "bg-[var(--color-warm-black)] text-white hover:bg-[var(--color-olive-green)] hover:text-[var(--color-warm-black)]"
      }`}
    >
      {isInCart ? (
        <>
          <Check size={18} />
          IN BOOKING CART
        </>
      ) : added ? (
        <>
          <Check size={18} />
          ADDED!
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          ADD TO BOOKING
        </>
      )}
    </button>
  );
}
