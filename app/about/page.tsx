"use client";

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  /* ── Animation Variants ── */
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  const charVariant: Variants = {
    hidden: { y: "120%" },
    visible: { y: "0%", transition: { duration: 0.8, ease: "circOut" } }
  };

  const staggerChars: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.025, delayChildren: 0.3 } }
  };

  /* ── Scroll-linked transforms ── */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

  const zoomRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: zoomScroll } = useScroll({ target: zoomRef, offset: ["start end", "end start"] });
  const zoomScale = useTransform(zoomScroll, [0, 0.5], [0.85, 1]);
  const zoomRadius = useTransform(zoomScroll, [0, 0.5], [40, 0]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: galleryScroll } = useScroll({ target: galleryRef, offset: ["start start", "end end"] });
  const img1Y = useTransform(galleryScroll, [0, 0.5], ["120%", "0%"]);
  const img2Y = useTransform(galleryScroll, [0.15, 0.6], ["120%", "0%"]);
  const img3Y = useTransform(galleryScroll, [0.3, 0.75], ["120%", "0%"]);
  const titleX1 = useTransform(galleryScroll, [0, 1], ["0%", "60%"]);
  const titleX2 = useTransform(galleryScroll, [0, 1], ["0%", "-40%"]);

  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: quoteScroll } = useScroll({ target: quoteRef, offset: ["start end", "end start"] });
  const quoteY = useTransform(quoteScroll, [0, 1], ["-15%", "15%"]);

  const heroTitle = "OUR ETHOS";
  const philosophyWords = "We approach beauty structurally, enhancing natural architecture while prioritizing total wellness. Every treatment is designed around your unique anatomy, lifestyle, and aesthetic vision.".split(" ");

  return (
    <main className="min-h-screen bg-[var(--color-creamy-white)] overflow-x-hidden pt-[55px]">

      {/* ─── HERO: Full-bleed cinematic opener ─── */}
      <section ref={heroRef} className="relative w-full h-[100dvh] overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 w-full h-full origin-center will-change-transform">
          <Image
            src="https://images.unsplash.com/photo-1637777269327-c4d5c7944d7b?auto=format&fit=crop&q=80&w=2000"
            alt="Davinia Devine clinic interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 flex flex-col justify-between p-[29px] pt-[80px] pb-[50px] z-10">
          {/* Char-by-char title */}
          <motion.div variants={staggerChars} initial="hidden" animate="visible" className="flex flex-wrap max-w-[900px]">
            {heroTitle.split("").map((char, i) => (
              <div key={i} className="inline-flex overflow-hidden">
                <motion.span
                  variants={charVariant}
                  className="inline-block text-white text-[50px] md:text-[140px] leading-[0.85] tracking-tight"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              </div>
            ))}
          </motion.div>

          {/* Bottom info strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row justify-between items-end gap-[30px]"
          >
            <p className="text-[16px] md:text-[20px] text-white/80 font-light leading-[1.5] max-w-[500px]">
              High-performance treatments in a space built for absolute tranquility. Est. 2018, London.
            </p>
            <div className="flex items-center gap-[30px]">
              {[
                { val: "7+", label: "Years" },
                { val: "15K", label: "Treatments" },
                { val: "98%", label: "Satisfaction" },
              ].map((s, i) => (
                <div key={i} className="text-right">
                  <span className="font-[family-name:var(--font-cardinal-fruit)] text-[36px] md:text-[48px] italic text-white leading-none block">{s.val}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-[50px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-[8px]"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-[50px] bg-white/30"
          />
        </motion.div>
      </section>

      {/* ─── PHILOSOPHY: Sticky text + scrolling images ─── */}
      <section className="py-[100px] md:py-[180px] px-[29px] max-w-[1440px] mx-auto">
        {/* Intro */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-[80px] md:mb-[120px]">
           <div className="max-w-[700px]">
             <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-[12px] mb-[30px]"
              >
                <span className="w-[40px] h-[1px] bg-[var(--color-olive-green)]" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-olive-green)] font-medium">The Davinia Standard</span>
              </motion.div>
              <motion.h2
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                className="font-[family-name:var(--font-cardinal-fruit)] text-[48px] md:text-[80px] leading-[0.9] text-[var(--color-warm-black)]"
              >
                Redefining <span className="italic text-[var(--color-olive-green)]">modern</span> beauty
              </motion.h2>
           </div>
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-[400px] mt-[40px] md:mt-0">
              <p className="text-[16px] leading-[1.6] opacity-70">
                {philosophyWords.join(" ")}
              </p>
           </motion.div>
        </div>

        {/* Dynamic Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[40px]">
          {/* Left Column (Image) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="md:col-span-5 flex flex-col justify-end pb-[40px] md:pb-[100px]"
          >
            <div className="relative w-full aspect-[3/4] rounded-[5px] overflow-hidden">
               <Image src="https://images.unsplash.com/photo-1581182800629-7d90925ad072?auto=format&fit=crop&q=80&w=800" alt="Skincare" fill className="object-cover" />
            </div>
          </motion.div>

          {/* Center Column (Text + Stats) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
            className="md:col-span-4 flex flex-col justify-center"
          >
             <p className="text-[20px] md:text-[24px] leading-[1.4] text-[var(--color-warm-black)] mb-[40px]">
               &quot;Results-driven care should never feel transactional. That&apos;s why we take the time to understand your unique anatomy before we begin.&quot;
             </p>
             <div className="flex flex-col gap-[30px] border-l border-[var(--color-stone)] pl-[20px]">
                {[
                  { value: "50+", label: "Expert Treatments" },
                  { value: "12", label: "Specialists" },
                  { value: "5K+", label: "Happy Clients" },
                ].map((stat, i) => (
                  <div key={i}>
                    <span className="font-[family-name:var(--font-cardinal-fruit)] text-[36px] leading-none text-[var(--color-olive-green)] italic">{stat.value}</span>
                    <span className="text-[11px] uppercase tracking-[0.15em] opacity-50 mt-[4px] font-medium block">{stat.label}</span>
                  </div>
                ))}
             </div>
          </motion.div>

          {/* Right Column (Image) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }}
            className="md:col-span-3 pt-[40px] md:pt-[80px]"
          >
             <div className="relative w-full aspect-[2/3] rounded-[5px] overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800" alt="Detail" fill className="object-cover" />
             </div>
             <div className="mt-[20px] text-right">
                <p className="text-[11px] uppercase tracking-[0.15em] opacity-60">Clinical Precision</p>
             </div>
          </motion.div>
        </div>

      </section>

      {/* ─── ZOOM REVEAL: Image scales from small to full-bleed ─── */}
      <section ref={zoomRef} className="py-[50px] px-[29px]">
        <motion.div
          style={{ scale: zoomScale, borderRadius: zoomRadius }}
          className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden origin-center will-change-transform"
        >
          <Image
            src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=2000"
            alt="Treatment experience"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[var(--color-warm-black)]/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="text-center px-[29px] max-w-[750px]"
            >
              <p className="text-[12px] uppercase tracking-[0.3em] text-white/50 font-medium mb-[20px]">Our Sanctuary</p>
              <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[40px] md:text-[64px] italic leading-[0.95] text-white mb-[25px]">
                An atmosphere of calm
              </h2>
              <p className="text-[16px] md:text-[18px] text-white/70 font-light leading-[1.6] max-w-[500px] mx-auto">
                Our flagship location abandons sterile, clinical environments in favor of warm, intentional luxury. Every detail is designed to ground you.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── TREATMENTS: Clip-path title + staggered cards ─── */}
      <section className="py-[100px] md:py-[160px] px-[29px] max-w-[1440px] mx-auto border-t border-[var(--color-stone)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mb-[100px] text-center"
        >
           <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[50px] md:text-[80px] italic leading-none text-[var(--color-warm-black)]">
            Curated <span className="not-italic text-[var(--color-olive-green)]">Treatments</span>
          </h2>
          <p className="mt-[20px] text-[12px] opacity-60 uppercase tracking-[0.25em] font-medium">Our Signature Selection</p>
        </motion.div>

        <div className="flex flex-col gap-[100px] md:gap-[150px]">
          {[
            { title: "The Sculpt", desc: "Structural contouring and facial harmonization using advanced dermal fillers. We rebuild and refine natural architecture.", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200" },
            { title: "The Glow", desc: "Deep cellular rejuvenation with bioremodeling and bespoke skin boosters for an unmatched, luminous complexion.", img: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=80&w=1200" },
            { title: "The Renewal", desc: "Medical-grade resurfacing and collagen induction therapy designed to restore flawless texture and tone.", img: "https://images.unsplash.com/photo-1516975080661-460d3dce06b0?auto=format&fit=crop&q=80&w=1200" },
          ].map((item, i) => {
             const isEven = i % 2 !== 0;
             return (
               <div key={i} className={`flex flex-col md:flex-row gap-[40px] md:gap-[80px] items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  {/* Image */}
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true, margin: "-100px" }}
                     transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                     className="w-full md:w-[55%] relative aspect-[4/3] rounded-[5px] overflow-hidden group"
                  >
                     <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-[2s] group-hover:scale-105" />
                  </motion.div>
                  
                  {/* Text */}
                  <motion.div 
                     initial={{ opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: "-100px" }}
                     transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                     className="w-full md:w-[45%] flex flex-col"
                  >
                     <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-olive-green)] font-medium mb-[16px]">0{i + 1} // Signature</span>
                     <h3 className="font-[family-name:var(--font-cardinal-fruit)] text-[40px] md:text-[54px] italic leading-[1] mb-[20px] text-[var(--color-warm-black)]">
                        {item.title}
                     </h3>
                     <p className="text-[16px] leading-[1.6] opacity-70 mb-[30px] max-w-[400px]">
                        {item.desc}
                     </p>
                     <Link href="/services" className="inline-flex items-center gap-[10px] text-[13px] font-medium tracking-[0.1em] uppercase hover:text-[var(--color-olive-green)] transition-colors group/btn">
                        <span className="border-b border-current pb-[2px]">Explore Treatment</span>
                        <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-[4px]" />
                     </Link>
                  </motion.div>
               </div>
             );
          })}
        </div>
      </section>

      {/* ─── PINNED GALLERY: Sliding photos with floating titles ─── */}
      

      {/* ─── QUOTE: Parallax cinematic quote ─── */}
      <section ref={quoteRef} className="w-full h-[70vh] md:h-[80vh] relative flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: quoteY }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <Image
            src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=2000"
            alt="Abstract beauty"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[var(--color-warm-black)]/55" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="relative z-10 px-[29px] text-center max-w-[900px]"
        >
          <h3 className="font-[family-name:var(--font-cardinal-fruit)] text-[36px] md:text-[64px] italic leading-[1.05] text-white">
            &quot;Beauty is an expression of inner vitality. We simply provide the canvas.&quot;
          </h3>
          <p className="text-[12px] uppercase tracking-[0.3em] text-white/50 font-medium mt-[35px]">— Davinia Devine, Founder</p>
        </motion.div>
      </section>

      {/* ─── CTA: Olive-green banner ─── */}
      <section className="bg-[var(--color-olive-green)] text-[var(--color-warm-black)] py-[80px] md:py-[100px] px-[29px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-[800px] mx-auto text-center"
        >
          <p className="text-[12px] uppercase tracking-[0.25em] font-medium opacity-60 mb-[20px]">Begin your transformation</p>
          <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[44px] md:text-[72px] leading-[0.95] italic mb-[25px]">
            Your journey starts here
          </h2>
          <p className="text-[16px] md:text-[18px] font-light leading-[1.6] opacity-70 mb-[40px] max-w-[500px] mx-auto">
            Book a complimentary consultation and discover a personalised treatment plan designed around you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-[10px] bg-[var(--color-warm-black)] text-white font-medium text-[14px] px-[35px] py-[16px] rounded-[5px] hover:opacity-90 transition-opacity tracking-wide"
          >
            BOOK YOUR APPOINTMENT
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
