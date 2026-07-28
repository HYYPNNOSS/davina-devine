"use client";

import { motion, Variants } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <main className="min-h-screen bg-[var(--color-creamy-white)] pt-[150px] pb-[100px] px-[29px]">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-[80px]">
          <h1 className="font-[family-name:var(--font-cardinal-fruit)] text-[60px] md:text-[80px] italic leading-none text-[var(--color-warm-black)] mb-[17px]">
            Get in touch
          </h1>
          <p className="text-[15px] opacity-60 uppercase tracking-widest max-w-[500px] mx-auto">
            Book a consultation or ask a question.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-[80px]">
          {/* Contact Form */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <form className="space-y-[33px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[33px]">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[13px] block font-medium">First Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-[var(--color-stone)] px-0 py-[10px] text-[16px] outline-none focus:border-[var(--color-warm-black)] transition-colors placeholder:opacity-30" placeholder="Jane" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[13px] block font-medium">Last Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-[var(--color-stone)] px-0 py-[10px] text-[16px] outline-none focus:border-[var(--color-warm-black)] transition-colors placeholder:opacity-30" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[13px] block font-medium">Email Address</label>
                <input type="email" className="w-full bg-transparent border-b border-[var(--color-stone)] px-0 py-[10px] text-[16px] outline-none focus:border-[var(--color-warm-black)] transition-colors placeholder:opacity-30" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-[13px] block font-medium">Message</label>
                <textarea rows={4} className="w-full bg-transparent border-b border-[var(--color-stone)] px-0 py-[10px] text-[16px] outline-none focus:border-[var(--color-warm-black)] transition-colors placeholder:opacity-30 resize-none" placeholder="How can we help you?" />
              </div>
              <button type="button" className="bg-[var(--color-warm-black)] text-white font-medium text-[14px] px-[40px] py-[15px] rounded-[5px] hover:bg-[var(--color-olive-green)] transition-colors flex items-center gap-[8px] mt-[25px]">
                SEND MESSAGE
                <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>

          {/* Details Sidebar */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-[50px] lg:border-l lg:border-[var(--color-stone)] lg:pl-[50px]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-50 mb-[17px] flex items-center gap-[8px]">
                <MapPin size={14} /> Location
              </p>
              <p className="text-[16px] leading-[1.6] text-[var(--color-warm-black)]">
                123 Oxford Street<br/>
                London, W1D 2HG<br/>
                United Kingdom
              </p>
            </div>
            
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-50 mb-[17px] flex items-center gap-[8px]">
                <Phone size={14} /> Contact
              </p>
              <a href="tel:01273040333" className="text-[22px] font-medium hover:text-[var(--color-olive-green)] transition-colors">01273 040 333</a>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-50 mb-[17px] flex items-center gap-[8px]">
                <Mail size={14} /> General Enquiries
              </p>
              <a href="mailto:info@daviniadevine.com" className="text-[16px] font-medium border-b border-[var(--color-warm-black)] pb-[2px] hover:text-[var(--color-olive-green)] hover:border-[var(--color-olive-green)] transition-colors">
                info@daviniadevine.com
              </a>
            </div>

            <div className="pt-[25px] border-t border-[var(--color-stone)]">
              <p className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-50 mb-[17px]">Hours</p>
              <div className="space-y-[8px] text-[14px]">
                <div className="flex justify-between"><span>Mon - Fri</span> <span className="font-medium">9am - 8pm</span></div>
                <div className="flex justify-between"><span>Saturday</span> <span className="font-medium">10am - 6pm</span></div>
                <div className="flex justify-between"><span>Sunday</span> <span className="font-medium text-[var(--color-olive-green)]">Closed</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
