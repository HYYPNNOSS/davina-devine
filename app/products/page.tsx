"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-creamy-white)] overflow-hidden flex items-center justify-center relative">
      
      {/* Cinematic Background */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full"
      >
        <Image
          src="https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=2000"
          alt="Premium skincare products"
          fill
          className="object-cover"
          priority
        />
        {/* Dark elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-warm-black)]/95 via-[var(--color-warm-black)]/60 to-[var(--color-warm-black)]/40" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-[29px] max-w-[800px] w-full pt-[55px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[12px] uppercase tracking-[0.3em] text-[var(--color-stone)] font-medium mb-[25px] block">
            The Davinia Collection
          </span>
          
          <h1 className="font-[family-name:var(--font-cardinal-fruit)] text-[60px] md:text-[110px] italic leading-[0.9] text-white mb-[35px]">
            Coming Soon
          </h1>
          
          <p className="text-[16px] md:text-[20px] text-white/70 font-light leading-[1.6] max-w-[500px] mx-auto mb-[60px]">
            We are curating an exclusive line of premium skincare and beauty essentials, designed to extend the Davinia Devine experience into your daily ritual.
          </p>

          <Link 
            href="/"
            className="inline-flex items-center gap-[12px] text-[13px] font-medium tracking-[0.15em] uppercase text-white/80 hover:text-[var(--color-olive-green)] transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-[4px]" />
            <span className="border-b border-current pb-[2px] transition-colors">Return to Home</span>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Bottom Anchor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-[50px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-[12px]"
      >
        <div className="w-[1px] h-[60px] bg-white/20" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Davinia Devine</span>
      </motion.div>
      
    </main>
  );
}
