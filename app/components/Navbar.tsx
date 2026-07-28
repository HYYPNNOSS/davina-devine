"use client";

import { motion } from 'framer-motion';
import { Search, User, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '../store/cartStore';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const pathname = usePathname();
  const { items, setCartOpen } = useCartStore();

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 flex items-center justify-between px-[17px] py-[13px] border-b border-[var(--color-stone)] bg-[var(--color-creamy-white)]/90 backdrop-blur-md"
      >
        <div className="flex-1">
          <Link href="/" className="font-medium text-[15px] uppercase tracking-wide text-[var(--color-warm-black)]">
            Davinia Devine
          </Link>
        </div>
        <div className="hidden md:flex gap-[17px] text-[13px] text-[var(--color-warm-black)]">
          <Link href="/menu" className={`hover:opacity-70 transition-opacity ${pathname === '/menu' ? 'border-b border-[var(--color-warm-black)]' : ''}`}>MENU</Link>
          <Link href="/#book-now" className="hover:opacity-70 transition-opacity">BOOK NOW</Link>
          <Link href="/about" className={`hover:opacity-70 transition-opacity ${pathname === '/about' ? 'border-b border-[var(--color-warm-black)]' : ''}`}>ABOUT</Link>
          <Link href="/blog" className={`hover:opacity-70 transition-opacity ${pathname.startsWith('/blog') ? 'border-b border-[var(--color-warm-black)]' : ''}`}>JOURNAL</Link>
          <Link href="/products" className={`hover:opacity-70 transition-opacity ${pathname === '/products' ? 'border-b border-[var(--color-warm-black)]' : ''}`}>PRODUCTS</Link>
          <Link href="/contact" className={`hover:opacity-70 transition-opacity ${pathname === '/contact' ? 'border-b border-[var(--color-warm-black)]' : ''}`}>CONTACT</Link>
          {/* <Link href="/admin" className={`hover:opacity-70 transition-opacity ${pathname === '/admin' ? 'border-b border-[var(--color-warm-black)]' : ''}`}>ADMIN</Link> */}
        </div>
        <div className="flex-1 flex justify-end gap-[17px] items-center text-[var(--color-warm-black)]">
          <div className="flex gap-[13px] items-center">
            {/* <Search size={15} strokeWidth={1.5} className="cursor-pointer hover:opacity-70 transition-opacity" /> */}
            {/* <User size={15} strokeWidth={1.5} className="cursor-pointer hover:opacity-70 transition-opacity" /> */}
            <div className="relative cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={15} strokeWidth={1.5} />
              {items.length > 0 && (
                <span className="absolute -top-[6px] -right-[6px] bg-[var(--color-olive-green)] text-[var(--color-warm-black)] text-[9px] font-bold w-[14px] h-[14px] flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
      <CartSidebar />
    </>
  );
}
