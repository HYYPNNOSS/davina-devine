"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '../store/cartStore';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const pathname = usePathname();
  const { items, setCartOpen } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'MENU', href: '/menu' },
    { label: 'BOOK NOW', href: '/' },
    { label: 'ABOUT', href: '/about' },
    { label: 'JOURNAL', href: '/blog' },
    { label: 'PRODUCTS', href: '/products' },
    { label: 'CONTACT', href: '/contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 flex items-center justify-between px-[17px] py-[13px] border-b border-[var(--color-stone)] bg-[var(--color-creamy-white)]/90 backdrop-blur-md"
      >
        <div className="flex-1">
          <Link href="/" className="font-medium text-[15px] uppercase tracking-wide text-[var(--color-warm-black)] relative z-[60]">
            Davinia Devine
          </Link>
        </div>
        <div className="hidden md:flex gap-[17px] text-[13px] text-[var(--color-warm-black)]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`hover:opacity-70 transition-opacity ${pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? 'border-b border-[var(--color-warm-black)]' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex-1 flex justify-end gap-[17px] items-center text-[var(--color-warm-black)] relative z-[60]">
          <div className="flex gap-[17px] items-center">
            <div className="relative cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={15} strokeWidth={1.5} />
              {items.length > 0 && (
                <span className="absolute -top-[6px] -right-[6px] bg-[var(--color-olive-green)] text-[var(--color-warm-black)] text-[9px] font-bold w-[14px] h-[14px] flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </div>
            {/* Hamburger Toggle */}
            <button
              className="md:hidden flex items-center justify-center w-[20px] h-[20px]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[var(--color-creamy-white)] flex flex-col justify-center items-center px-[29px]"
          >
            <div className="flex flex-col gap-[33px] text-center w-full">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    className="font-[family-name:var(--font-cardinal-fruit)] text-[44px] italic text-[var(--color-warm-black)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute bottom-[50px] flex flex-col gap-[10px] text-center text-[13px] uppercase tracking-[0.2em] font-medium opacity-50"
            >
              <span>Est. 2018</span>
              <span>London</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <CartSidebar />
    </>
  );
}
