"use client";

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { WaxingFigure } from '../components/WaxingFigure';

export default function MenuPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWaxArea, setHoveredWaxArea] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(services.map(s => s.category || 'Other')));

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <main className="min-h-screen bg-[var(--color-creamy-white)] overflow-hidden">
      
      {/* Cinematic Header */}
      <section className="pt-[150px] md:pt-[200px] pb-[80px] px-[29px] max-w-[1440px] mx-auto border-b border-[var(--color-stone)]">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center text-center">
          <motion.span variants={fadeUp} className="text-[12px] uppercase tracking-[0.3em] text-[var(--color-olive-green)] font-medium mb-[25px]">
            The Davinia Standard
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-[family-name:var(--font-cardinal-fruit)] text-[70px] md:text-[120px] italic leading-[0.85] text-[var(--color-warm-black)] mb-[35px]">
            Curated Menu
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[16px] md:text-[20px] opacity-70 font-light max-w-[500px] mx-auto leading-[1.6]">
            A bespoke selection of advanced treatments, designed to enhance natural architecture and cultivate total wellness.
          </motion.p>
        </motion.div>
      </section>

      {/* Services List */}
      <section className="py-[100px] px-[29px] max-w-[1440px] mx-auto">
        {loading ? (
          <div className="flex justify-center py-[100px]">
            <div className="w-[40px] h-[40px] border-2 border-[var(--color-olive-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <p className="text-center opacity-50 py-[100px] text-[18px]">The menu is currently being updated.</p>
        ) : (
          <div className="space-y-[150px]">
            {categories.map((category) => {
              const categoryServices = services.filter(s => (s.category || 'Other') === category);
              if (categoryServices.length === 0) return null;

              if (category === "Waxing") {
                return (
                  <div key={category}>
                    <motion.div 
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-[20px] mb-[80px]"
                    >
                      <h2 className="text-[32px] md:text-[50px] font-medium text-[var(--color-warm-black)] leading-none uppercase tracking-tight">
                        {category}
                      </h2>
                      <span className="flex-1 h-[1px] bg-[var(--color-stone)]" />
                    </motion.div>

                    <div className="flex flex-col lg:flex-row gap-[50px] lg:gap-[100px] items-start">
                      {/* Left: Waxing Services List */}
                      <div className="w-full lg:w-1/2 flex flex-col gap-[30px]">
                        {categoryServices.map((service, index) => (
                          <Link href={`/services/${service.id}`} key={service.id}>
                            <motion.div 
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-50px" }}
                              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                              className="flex flex-col group cursor-pointer border-b border-[var(--color-stone)] pb-[20px]"
                              onMouseEnter={() => {
                                if (service.waxArea) {
                                  setHoveredWaxArea(service.waxArea);
                                }
                              }}
                              onMouseLeave={() => setHoveredWaxArea(null)}
                            >
                              <div className="flex justify-between items-start mb-[5px]">
                                <h3 className="font-[family-name:var(--font-cardinal-fruit)] text-[28px] md:text-[34px] italic pr-[15px] leading-[1.1] text-[var(--color-warm-black)] group-hover:text-[var(--color-olive-green)] transition-colors duration-500">
                                  {service.name}
                                </h3>
                                <span className="text-[16px] font-medium shrink-0 text-[var(--color-olive-green)] pt-[5px]">{service.price}</span>
                              </div>
                              <div className="flex items-center justify-between mt-[10px]">
                                <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 font-medium">
                                  {service.duration}
                                </p>
                                <span className="text-[11px] font-medium tracking-[0.15em] uppercase border-b border-[var(--color-warm-black)] pb-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-[10px] group-hover:translate-y-0 text-[var(--color-warm-black)]">
                                  Book Now
                                </span>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>

                      {/* Right: Sticky Waxing Figure */}
                      <div className="w-full lg:w-1/2 lg:sticky lg:top-[120px] h-[500px] md:h-[700px] flex items-center justify-center overflow-hidden">
                         <WaxingFigure highlightedZones={hoveredWaxArea ? hoveredWaxArea.split(',') : []} />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={category}>
                  {/* Category Title */}
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-[20px] mb-[80px]"
                  >
                    <h2 className="text-[32px] md:text-[50px] font-medium text-[var(--color-warm-black)] leading-none uppercase tracking-tight">
                      {category}
                    </h2>
                    <span className="flex-1 h-[1px] bg-[var(--color-stone)]" />
                  </motion.div>

                  {/* Staggered 3-Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] md:gap-[60px] items-start">
                    {categoryServices.map((service, index) => {
                      // The staggering logic: left stays top, middle pushed down significantly, right pushed down slightly
                      const pushClass = index % 3 === 1 ? 'md:mt-[120px]' : index % 3 === 2 ? 'md:mt-[60px]' : 'md:mt-0';

                      return (
                        <Link href={`/services/${service.id}`} key={service.id} className={pushClass}>
                          <motion.div 
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1, delay: (index % 3) * 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col group cursor-pointer"
                          >
                            <div className="w-full aspect-[3/4] relative overflow-hidden rounded-[5px] mb-[25px]">
                              <Image 
                                src={service.imageUrl || "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800"} 
                                alt={service.name} 
                                fill 
                                className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-[var(--color-warm-black)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </div>
                            
                            <div className="flex flex-col">
                              <div className="flex justify-between items-start mb-[10px]">
                                <h3 className="font-[family-name:var(--font-cardinal-fruit)] text-[32px] md:text-[38px] italic pr-[15px] leading-[1.1] text-[var(--color-warm-black)] group-hover:text-[var(--color-olive-green)] transition-colors duration-500">
                                  {service.name}
                                </h3>
                                <span className="text-[16px] font-medium shrink-0 text-[var(--color-olive-green)] pt-[8px]">{service.price}</span>
                              </div>
                              
                              {service.description && (
                                 <p className="text-[14px] leading-[1.6] opacity-60 mb-[16px] font-light max-w-[95%]">
                                   {service.description}
                                 </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-auto pt-[10px]">
                                <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 font-medium">
                                  {service.duration}
                                </p>
                                
                                <span className="text-[11px] font-medium tracking-[0.15em] uppercase border-b border-[var(--color-warm-black)] pb-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-[10px] group-hover:translate-y-0 text-[var(--color-warm-black)]">
                                  Book Now
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
