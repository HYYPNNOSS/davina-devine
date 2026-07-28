"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="bg-[var(--color-olive-green)] text-[var(--color-creamy-white)] py-[44px] px-[29px] relative z-10"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-[33px]">
        <span className="font-[family-name:var(--font-cardinal-fruit)] text-[33px] italic opacity-90 tracking-wide">
          Davinia Devine
        </span>

        <div className="flex flex-wrap justify-center gap-[25px] text-[13px] font-medium text-[var(--color-creamy-white)]">
          <Link href="#" className="hover:opacity-70 transition-opacity">TERMS & CONDITIONS</Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">PRIVACY POLICY</Link>
          <Link href="/about" className="hover:opacity-70 transition-opacity">CAREERS</Link>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:opacity-70 transition-opacity">
            BACK TO TOP
          </button>
        </div>
      </div>
    </motion.footer>
  );
}
