"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, Calendar } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useState } from 'react';
import Image from 'next/image';

export default function CartSidebar() {
  const { items, removeItem, clearCart, isCartOpen, setCartOpen } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Calculate rough total (assuming format "£25.00")
  const calculateTotal = () => {
    let total = 0;
    items.forEach(item => {
      const match = item.price.match(/[\d.]+/);
      if (match) total += parseFloat(match[0]);
    });
    return `£${total.toFixed(2)}`;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !selectedDate || items.length === 0) return;

    setStatus('loading');
    const serviceNames = items.map(i => i.name).join(', ');

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          date: selectedDate,
          service: serviceNames,
          guests: 1, // Defaulting to 1 for multi-service cart
        }),
      });

      if (res.ok) {
        setStatus('success');
        clearCart();
        setTimeout(() => {
          setStatus('idle');
          setCartOpen(false);
          setIsCheckingOut(false);
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-[480px] bg-[var(--color-creamy-white)] z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[29px] py-[25px] border-b border-[var(--color-stone)]">
              <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[32px] italic leading-none">Your Booking</h2>
              <button onClick={() => setCartOpen(false)} className="p-[8px] hover:bg-black/5 rounded-full transition-colors">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto px-[29px] py-[25px]"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {status === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-[60px] h-[60px] rounded-full bg-[var(--color-olive-green)]/20 text-[var(--color-olive-green)] flex items-center justify-center mb-[20px]">
                    <ArrowRight className="rotate-90" size={30} />
                  </div>
                  <h3 className="text-[24px] font-[family-name:var(--font-cardinal-fruit)] italic mb-[10px]">Booking Confirmed!</h3>
                  <p className="text-[15px] opacity-70">We'll be in touch shortly to confirm your appointment time.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <p className="text-[18px] font-medium mb-[8px]">Your cart is empty</p>
                  <p className="text-[14px]">Explore our menu and add some treatments.</p>
                </div>
              ) : !isCheckingOut ? (
                <div className="flex flex-col gap-[15px]">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-[15px] bg-white rounded-[10px] p-[15px] shadow-sm border border-[var(--color-stone)]">
                      <div className="relative w-[70px] h-[70px] rounded-[5px] overflow-hidden shrink-0 bg-[var(--color-creamy-white)]">
                        {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-[11px] uppercase tracking-wider text-[var(--color-olive-green)] font-medium mb-[4px]">{item.category}</p>
                        <h4 className="text-[15px] font-medium truncate">{item.name}</h4>
                        <div className="flex items-center justify-between mt-[6px]">
                          <p className="text-[13px] opacity-60">{item.duration}</p>
                          <p className="text-[14px] font-medium">{item.price}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="self-center p-[8px] text-red-500/70 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col gap-[20px]">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium opacity-70 block mb-[8px]">Select Date</label>
                    <div className="relative flex items-center bg-white border border-[var(--color-stone)] rounded-[8px] px-[15px] py-[12px]">
                      <Calendar size={18} className="opacity-50 shrink-0 mr-[10px]" />
                      <input 
                        type="date" 
                        required 
                        min={today}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-transparent outline-none text-[15px]" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium opacity-70 block mb-[8px]">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-[var(--color-stone)] rounded-[8px] px-[15px] py-[12px] text-[15px] outline-none focus:border-[var(--color-olive-green)]" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium opacity-70 block mb-[8px]">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full bg-white border border-[var(--color-stone)] rounded-[8px] px-[15px] py-[12px] text-[15px] outline-none focus:border-[var(--color-olive-green)]" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium opacity-70 block mb-[8px]">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 7700 900077"
                      className="w-full bg-white border border-[var(--color-stone)] rounded-[8px] px-[15px] py-[12px] text-[15px] outline-none focus:border-[var(--color-olive-green)]" 
                    />
                  </div>
                  {status === 'error' && (
                    <p className="text-red-500 text-[13px]">Something went wrong. Please try again.</p>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && status !== 'success' && (
              <div className="p-[29px] border-t border-[var(--color-stone)] bg-white">
                <div className="flex justify-between items-center mb-[20px]">
                  <span className="text-[15px] font-medium opacity-70">Total (Est.)</span>
                  <span className="text-[22px] font-medium">{calculateTotal()}</span>
                </div>
                {!isCheckingOut ? (
                  <button 
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full bg-[var(--color-warm-black)] text-white font-medium py-[16px] rounded-[8px] hover:bg-[var(--color-olive-green)] hover:text-[var(--color-warm-black)] transition-colors"
                  >
                    Proceed to Booking
                  </button>
                ) : (
                  <div className="flex gap-[10px]">
                    <button 
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="flex-1 bg-[var(--color-stone)]/30 text-[var(--color-warm-black)] font-medium py-[16px] rounded-[8px] hover:bg-[var(--color-stone)]/50 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      form="checkout-form"
                      type="submit"
                      disabled={status === 'loading'}
                      className="flex-[2] bg-[var(--color-warm-black)] text-white font-medium py-[16px] rounded-[8px] hover:bg-[var(--color-olive-green)] hover:text-[var(--color-warm-black)] transition-colors disabled:opacity-50"
                    >
                      {status === 'loading' ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
