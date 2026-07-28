"use client";

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Search, User, ShoppingBag, ArrowRight, ArrowLeft, Calendar, ChevronDown, Clock, Users, X, Check } from 'lucide-react';
import Lenis from 'lenis';
import Link from 'next/link';
import TiltCard from './components/TiltCard';

// Reusable ClipPathTitle Component (Inspired by Awwwards BenefitSection)
const ClipPathTitle = ({ title, bg, color }: { title: string, bg: string, color: string }) => (
  <motion.div
    initial={{ clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)", opacity: 0 }}
    whileInView={{ clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)", opacity: 1 }}
    transition={{ duration: 1, ease: "circOut" }}
    viewport={{ once: true, margin: "-50px" }}
    className="overflow-hidden w-full border-b border-[var(--color-creamy-white)]"
  >
    <div className="py-[33px] px-[29px]" style={{ backgroundColor: bg, color: color }}>
      <h2 className="text-[33px] md:text-[50px] font-medium leading-none text-center">{title}</h2>
    </div>
  </motion.div>
);



export default function Home() {
  const [SERVICES, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(data => setServices(data));
  }, []);

  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Reservation state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const handleBookNow = () => {
    if (!selectedDate || !selectedService) return;
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingName || !bookingEmail || !bookingPhone || !selectedDate || !selectedService) return;
    
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingName,
          email: bookingEmail,
          phone: bookingPhone,
          date: selectedDate,
          service: selectedService,
          guests: guests,
        })
      });
      setBookingConfirmed(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingConfirmed(false);
        setBookingName('');
        setBookingEmail('');
        setBookingPhone('');
        setSelectedDate('');
        setSelectedService('');
        setGuests(1);
      }, 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedServiceData = SERVICES.find(s => s.name === selectedService);

  // Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Hero Scroll Animation (Inspired by Awwwards HeroSection)
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroRotate = useTransform(heroScroll, [0, 1], [0, 7]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.9]);
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroScroll, [0.5, 1], [1, 0]);

  // Pinned Gallery Animation (Inspired by Awwwards TestimonialSection)
  const galleryRef = useRef(null);
  const { scrollYProgress: galleryScroll } = useScroll({
    target: galleryRef,
    offset: ["start start", "end end"]
  });

  const title1X = useTransform(galleryScroll, [0, 1], ["0%", "70%"]);
  const title2X = useTransform(galleryScroll, [0, 1], ["0%", "25%"]);
  const title3X = useTransform(galleryScroll, [0, 1], ["0%", "-50%"]);

  const img1Y = useTransform(galleryScroll, [0, 0.5], ["150%", "0%"]);
  const img2Y = useTransform(galleryScroll, [0.2, 0.7], ["150%", "0%"]);
  const img3Y = useTransform(galleryScroll, [0.4, 0.9], ["150%", "0%"]);

  // Variants
  const subtitleClipVariant: Variants = {
    hidden: { clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)" },
    visible: {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      transition: { duration: 1, ease: "circOut", delay: 1 }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: 0.5 }
    }
  };

  const charVariant: Variants = {
    hidden: { y: "200%" },
    visible: {
      y: "0%",
      transition: { duration: 0.8, ease: "circOut" }
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  const desktopHeroTitle = "LONDON'S PREMIER BEAUTY CLINIC & LOUNGE";
  const mobileHeroTitle = "WELCOME TO DAVINIA DEVINE";
  const editorialWords = "Welcome to Davinia Devine, a leading clinic in London renowned for its premium treatments, VIP Experience and holistic wellbeing.".split(" ");
  const servicesToDisplay = SERVICES.slice(0, 6);

  return (
    <main ref={containerRef} className="min-h-screen bg-[var(--color-creamy-white)] overflow-x-hidden">

      {/* Hero Animated Framing */}
      <section ref={heroRef} className="relative w-full h-[100dvh] mt-[55px]">
        <div className="sticky top-[55px] w-full h-[calc(100dvh-55px)] overflow-hidden flex items-center justify-center bg-[var(--color-creamy-white)]">
          <motion.div
            style={{
              rotate: heroRotate,
              scale: heroScale,
              y: heroY,
              opacity: heroOpacity
            }}
            className="absolute inset-0 w-full h-full bg-[var(--color-creamy-white)] will-change-transform origin-center overflow-hidden"
          >
            <Image
              src="/hero-bg.png"
              alt="Davinia Devine Beauty Hotspot"
              fill
              className="object-cover"
              priority
            />

{/*  */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

            <div className="absolute inset-0 p-[29px] pt-[60px] pointer-events-none flex flex-col justify-between pb-[50px]">
              
              {/* Desktop Title */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="hidden md:flex max-w-[1100px] flex-wrap"
              >
                {desktopHeroTitle.split(" ").map((word, i) => (
                  <div key={i} className="inline-flex overflow-hidden mr-[30px]">
                    {word.split("").map((char, j) => (
                      <motion.span
                        key={j}
                        variants={charVariant}
                        className="inline-block text-white text-[132px] leading-[0.85] tracking-tight"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                ))}
              </motion.div>

              {/* Mobile Title */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex md:hidden max-w-[1100px] flex-wrap"
              >
                {mobileHeroTitle.split(" ").map((word, i) => (
                  <div key={i} className="inline-flex overflow-hidden mr-[15px]">
                    {word.split("").map((char, j) => (
                      <motion.span
                        key={j}
                        variants={charVariant}
                        className="inline-block text-white text-[44px] leading-[0.85] tracking-tight"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                ))}
              </motion.div>

              {/* Reservation Booking Strip */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full max-w-[900px]"
              >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[10px] p-[6px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col md:flex-row items-stretch gap-[6px]">

                    {/* Date Picker */}
                    <div className="flex-1 relative group">
                      <div className="bg-white/10 hover:bg-white/15 transition-colors rounded-[7px] px-[17px] py-[14px] flex items-center gap-[12px] cursor-pointer">
                        <Calendar size={16} strokeWidth={1.5} className="text-white/60 shrink-0" />
                        <div className="flex-1 relative">
                          <label className="text-[11px] uppercase tracking-[0.15em] text-white/50 font-medium block mb-[2px]">Date</label>
                          <input
                            type="date"
                            min={today}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-transparent text-white text-[15px] font-medium outline-none cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                          />
                          {!selectedDate && <span className="absolute top-[50%] -translate-y-[30%] left-0 text-white/40 text-[15px] pointer-events-none">Choose date</span>}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-[1px] bg-white/10 my-[10px]" />

                    {/* Service Selector */}
                    <div className="flex-[1.5] relative">
                      <div
                        onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                        className="bg-white/10 hover:bg-white/15 transition-colors rounded-[7px] px-[17px] py-[14px] flex items-center gap-[12px] cursor-pointer"
                      >
                        <Clock size={16} strokeWidth={1.5} className="text-white/60 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <label className="text-[11px] uppercase tracking-[0.15em] text-white/50 font-medium block mb-[2px]">Service</label>
                          <p className={`text-[15px] font-medium truncate ${selectedService ? 'text-white' : 'text-white/40'}`}>
                            {selectedService || 'Select treatment'}
                          </p>
                        </div>
                        <ChevronDown size={14} strokeWidth={1.5} className={`text-white/50 shrink-0 transition-transform duration-300 ${serviceDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Service Dropdown */}
                      {serviceDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-full left-0 right-0 mb-[8px] bg-[var(--color-warm-black)]/95 backdrop-blur-xl border border-white/15 rounded-[10px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50 max-h-[280px] overflow-y-auto"
                        >
                          {SERVICES.map((service, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedService(service.name);
                                setServiceDropdownOpen(false);
                              }}
                              className={`w-full text-left px-[17px] py-[13px] flex items-center justify-between gap-[12px] transition-colors ${selectedService === service.name
                                  ? 'bg-[var(--color-olive-green)]/20 text-[var(--color-olive-green)]'
                                  : 'text-white/80 hover:bg-white/8'
                                } ${idx !== SERVICES.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                              <div className="min-w-0">
                                <p className="text-[14px] font-medium truncate">{service.name}</p>
                                <p className="text-[12px] opacity-50 mt-[2px]">{service.duration}</p>
                              </div>
                              <span className="text-[13px] font-medium shrink-0 opacity-70">{service.price}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-[1px] bg-white/10 my-[10px]" />

                    {/* Guests */}
                    <div className="flex-[0.6] relative">
                      <div className="bg-white/10 hover:bg-white/15 transition-colors rounded-[7px] px-[17px] py-[14px] flex items-center gap-[12px] cursor-pointer">
                        <Users size={16} strokeWidth={1.5} className="text-white/60 shrink-0" />
                        <div className="flex-1">
                          <label className="text-[11px] uppercase tracking-[0.15em] text-white/50 font-medium block mb-[2px]">Guests</label>
                          <select
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full bg-transparent text-white text-[15px] font-medium outline-none cursor-pointer appearance-none"
                          >
                            {[1, 2, 3, 4, 5, 6].map(n => (
                              <option key={n} value={n} className="bg-[var(--color-warm-black)] text-white">{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <button
                      onClick={handleBookNow}
                      disabled={!selectedDate || !selectedService}
                      className={`md:w-auto px-[33px] py-[14px] rounded-[7px] font-medium text-[15px] transition-all duration-300 flex items-center justify-center gap-[8px] shrink-0 ${selectedDate && selectedService
                          ? 'bg-[var(--color-olive-green)] text-[var(--color-warm-black)] hover:brightness-110 shadow-[0_4px_16px_rgba(246,142,109,0.3)]'
                          : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                    >
                      BOOK NOW
                      <ArrowRight size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Selected service info pill */}
                {selectedServiceData && selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-[10px] flex items-center gap-[10px] text-white/60 text-[13px] px-[8px]"
                  >
                    <span className="bg-white/10 px-[10px] py-[4px] rounded-full">{selectedServiceData.duration}</span>
                    <span className="bg-white/10 px-[10px] py-[4px] rounded-full">From {selectedServiceData.price}</span>
                    <span className="bg-white/10 px-[10px] py-[4px] rounded-full">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Horizontal Keyword Marquee (fills the gap between hero + quote) */}
      <section className="py-[44px] border-y border-[var(--color-stone)] overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center shrink-0">
              {["NAILS", "HAIR", "BROWS & LASHES", "AESTHETICS", "FACIALS", "BODY TREATMENTS", "VIP EXPERIENCE", "HOLISTIC WELLBEING", "NAIL ART", "BLOW DRY BAR"].map((item, i) => (
                <span key={i} className="flex items-center">
                  <span className="font-[family-name:var(--font-cardinal-fruit)] text-[33px] md:text-[50px] italic opacity-70 px-[25px]">{item}</span>
                  <span className="w-[6px] h-[6px] rounded-full bg-[var(--color-olive-green)] shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Brand Ethos / Quote */}
      <section className="py-[80px] px-[29px] max-w-[1440px] mx-auto flex justify-center items-center text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-[900px]"
        >
          <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[40px] md:text-[80px] leading-[1] tracking-tight text-[var(--color-warm-black)]">
            &quot;Beauty and wellness as an inclusive, luxurious experience for all.&quot;
          </h2>
          <p className="mt-[33px] text-[15px] uppercase tracking-widest opacity-60">Davinia Devine</p>
        </motion.div>
      </section>

      {/* Sticky Scroll Editorial Section (Awwwards Message word-highlight applied) */}
      <section className="relative w-full max-w-[1440px] mx-auto px-[29px] py-[50px]">

        {/* Decorative vertical text — left edge */}
        <div className="hidden lg:flex absolute left-[-10px] top-[200px] z-20">
          <span className="text-[11px] uppercase tracking-[0.35em] text-[var(--color-stone)] font-medium [writing-mode:vertical-lr] rotate-180 select-none">
            Est. London — Premium Clinic
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-[50px] lg:gap-[67px] items-start">

          
          <div className="w-full lg:w-[48%] lg:sticky lg:top-[130px] pb-[100px] lg:pb-0 z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              {/* Section label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-[12px] mb-[33px]"
              >
                <span className="w-[40px] h-[1px] bg-[var(--color-olive-green)]" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-olive-green)] font-medium">Our Story</span>
              </motion.div>

              <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[42px] md:text-[58px] leading-[0.95] mb-[40px] relative">
                Head to toe beauty: <br />
                <span className="italic opacity-80">(All under one luxurious roof)</span>
                {/* Decorative underline accent */}
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block w-[80px] h-[3px] bg-[var(--color-olive-green)] mt-[25px] origin-left rounded-full"
                />
              </h2>

              <div className="text-[20px] md:text-[22px] leading-[1.45] mb-[33px] max-w-[500px]">
                {/* Word-by-word highlight effect (Inspired by MessageSection) */}
                <motion.p
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ margin: "-100px" }}
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                  {editorialWords.map((word, i) => (
                    <motion.span
                      key={i}
                      variants={{ hidden: { opacity: 0.15 }, visible: { opacity: 1 } }}
                      transition={{ duration: 0.5 }}
                    >
                      {word}{" "}
                    </motion.span>
                  ))}
                </motion.p>
              </div>

              <div className="text-[15px] leading-[1.6] space-y-[25px] max-w-[500px]">
                <p className="opacity-75">
                  Our flagship location is more than a spa, it&apos;s a haven for clinical excellence, professional care, and precise results. Through elevated treatments and service, we invite our community to embrace their individuality, nurture their wellbeing, and discover confidence in every form.
                </p>
                <motion.button
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                  className="group flex items-center gap-[10px] text-[13px] font-medium mt-[17px] text-[var(--color-warm-black)] hover:text-[var(--color-olive-green)] transition-colors duration-300"
                >
                  <span className="border-b border-current pb-[2px]">READ OUR STORY</span>
                  <ArrowRight size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-[3px]" />
                </motion.button>
              </div>

              {/* Stat counters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-[40px] mt-[50px] pt-[33px] border-t border-[var(--color-stone)]"
              >
                {[
                  { value: "10+", label: "Years of Excellence" },
                  { value: "50+", label: "Expert Treatments" },
                  { value: "5K+", label: "Happy Clients" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="font-[family-name:var(--font-cardinal-fruit)] text-[32px] md:text-[38px] leading-none text-[var(--color-olive-green)] italic">{stat.value}</span>
                    <span className="text-[11px] uppercase tracking-[0.15em] opacity-50 mt-[8px] font-medium">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Scrolling Images */}
          <div className="w-full lg:w-[52%] flex flex-col gap-[17px] pb-[150px]">

            {/* Top row: Two images side by side */}
            <div className="grid grid-cols-2 gap-[17px]">

              {/* Image 1 — Tall portrait */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[3/4] rounded-[8px] overflow-hidden group perspective-[1000px]"
              >
                <TiltCard>
                  <Image
                    src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800"
                    alt="Professional beauty products and tools"
                    fill
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  {/* Floating label */}
                  <div className="absolute bottom-[16px] left-[16px] right-[16px]">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-white/70 font-medium">Premium Products</p>
                    <p className="text-[14px] font-medium text-white mt-[3px]">Curated with care</p>
                  </div>
                </TiltCard>
              </motion.div>

              {/* Image 2 — Square with top spacing */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-[17px] pt-[50px] perspective-[1000px]"
              >
                <div className="relative aspect-square rounded-[8px] overflow-hidden group">
                  <TiltCard>
                    <Image
                      src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800"
                      alt="Luxurious facial treatment in progress"
                      fill
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                    {/* Rating badge — contained inside */}
                    <div className="absolute bottom-[16px] right-[16px] bg-[var(--color-warm-black)]/90 backdrop-blur-sm text-white px-[14px] py-[10px] rounded-[6px]">
                      <span className="font-[family-name:var(--font-cardinal-fruit)] text-[22px] italic leading-none block">4.9★</span>
                      <span className="text-[9px] uppercase tracking-[0.12em] opacity-60 mt-[3px] block">Client Rating</span>
                    </div>
                  </TiltCard>
                </div>

                {/* Small accent image below */}
                <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden group">
                  <TiltCard>
                    <Image
                      src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800"
                      alt="Salon detail"
                      fill
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </TiltCard>
                </div>
              </motion.div>
            </div>

            {/* Bottom: Full-width cinematic image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-[16/9] rounded-[8px] overflow-hidden group perspective-[1000px]"
            >
              <TiltCard>
                <Image
                  src="https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&q=80&w=1400"
                  alt="Serene salon interior and atmosphere"
                  fill
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                {/* Caption overlay */}
                <div className="absolute bottom-[20px] left-[20px]">
                  <p className="text-[14px] text-white font-medium">Our Flagship Clinic</p>
                  <p className="text-[12px] text-white/60 mt-[2px]">Central London</p>
                </div>
              </TiltCard>
            </motion.div>

          </div>
        </div>
      </section>

      {/* The Davinia Standard (Inspired by Awwwards BenefitSection clip-paths) */}
      <section className="py-[100px]">
        <div className="max-w-[1440px] mx-auto px-[29px] mb-[33px]">
          <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[42px] leading-none text-center italic opacity-80">
            The Davinia Standard
          </h2>
        </div>
        <section className="w-full mt-[33px]">
          <div className="h-[250px] md:h-[600px] w-full overflow-hidden relative">
            <video
              src="/animo.webm"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Editorial content beneath the standards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="max-w-[900px] mx-auto px-[29px] mt-[67px] text-center"
        >
          <p className="text-[22px] leading-[1.4] mb-[25px]">
            Our in-house nail bar is home to industry-leading specialists trained in the latest treatments using The GelBottle Inc products. From BIAB™ and intricate nail art to luxurious extensions, every detail is perfected.
          </p>
          <p className="text-[15px] leading-[1.4] opacity-70">
            We pair cutting-edge technique with an atmosphere of total privacy, ensuring every guest receives a bespoke, unhurried experience — from the first consultation to the finishing touch.
          </p>
          <p className="mt-[33px] text-[15px] uppercase tracking-widest opacity-60">And much more ...</p>
        </motion.div>
      </section>

      {/* Treatments Section */}
      <section className="py-[100px] px-[29px] max-w-[1440px] mx-auto border-t border-[var(--color-stone)]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="flex justify-between items-end mb-[50px]"
        >
          <h3 className="font-medium text-[50px] leading-none tracking-tight">TREATMENTS</h3>
          <div className="hidden md:flex gap-[8px]">
            <button className="w-[33px] h-[33px] rounded-[5px] border border-[var(--color-stone)] flex items-center justify-center hover:bg-[var(--color-stone)] transition-colors">
              <ArrowLeft size={16} strokeWidth={1.5} />
            </button>
            <button className="w-[33px] h-[33px] rounded-[5px] border border-[var(--color-stone)] flex items-center justify-center hover:bg-[var(--color-stone)] transition-colors">
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[33px]"
        >
          {servicesToDisplay.map((item, idx) => (
            <Link href={`/services/${item.id}`} key={item.id || idx}>
              <motion.div variants={fadeUp} className="bg-transparent flex flex-col group cursor-pointer h-full">
                <div className="relative aspect-square rounded-[5px] overflow-hidden bg-[var(--color-creamy-white)]">
                  {item.category && (
                    <div className="absolute top-[10px] right-[10px] z-10 bg-[var(--color-stone)] text-[var(--color-warm-black)] text-[13px] font-medium px-[8px] py-[4px] rounded-[5px] uppercase">
                      {item.category}
                    </div>
                  )}
                  <Image
                    src={item.imageUrl || "https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?auto=format&fit=crop&q=80&w=800"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="pt-[17px] flex justify-between items-start flex-1">
                  <div>
                    <h4 className="font-medium text-[15px]">{item.name}</h4>
                    {item.waxArea && (
                      <p className="text-[11px] uppercase tracking-wider text-[var(--color-olive-green)] font-medium mt-[4px]">Area: {item.waxArea}</p>
                    )}
                    {item.description ? (
                       <p className="text-[13px] text-opacity-80 max-w-[90%] mt-[4px] leading-[1.4] line-clamp-2">{item.description}</p>
                    ) : (
                       <p className="text-[13px] text-opacity-80 max-w-[90%] mt-[4px] leading-[1.3]">{item.duration} &middot; {item.price}</p>
                    )}
                    {item.description && (
                       <p className="text-[12px] opacity-50 mt-[6px] font-medium tracking-wide">{item.duration} &middot; {item.price}</p>
                    )}
                  </div>
                  <span className="text-[13px] font-medium shrink-0 group-hover:underline">MORE</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Pinned Sliding Gallery (Inspired by Awwwards TestimonialSection) */}
      <section ref={galleryRef} className="relative w-full h-[150vh]">
        <div className="sticky top-0 w-full h-screen overflow-hidden bg-[var(--color-creamy-white)] flex items-center justify-center border-t border-[var(--color-stone)]">

          {/* Animated Titles */}
          <div className="absolute inset-0 size-full flex flex-col items-center pt-[100px] z-20 pointer-events-none">
            <motion.h1 style={{ x: title1X }} className="font-[family-name:var(--font-cardinal-fruit)] text-[45px] md:text-[100px] leading-none italic opacity-80 text-[var(--color-warm-black)]">Discover</motion.h1>
            <motion.h1 style={{ x: title2X }} className="text-[60px] md:text-[140px] leading-[0.8] text-[var(--color-warm-black)]">YOUR</motion.h1>
            <motion.h1 style={{ x: title3X }} className="font-[family-name:var(--font-cardinal-fruit)] text-[45px] md:text-[100px] leading-none italic opacity-80 text-[var(--color-warm-black)]">Confidence</motion.h1>
          </div>

          {/* Sliding Images */}
          <div className="relative w-full h-full max-w-[1440px] mx-auto z-10 flex justify-center items-center gap-[17px] px-[29px] pt-[50px]">
            {/* Card 1 */}
            <motion.div style={{ y: img1Y }} className="relative w-[30%] min-w-[100px] md:min-w-0 aspect-[3/4] rounded-[5px] overflow-hidden rotate-[-2deg] mt-[100px]">
              <Image src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" alt="Gallery 1" fill className="object-cover" />
            </motion.div>

            {/* Card 2 */}
            <motion.div style={{ y: img2Y }} className="relative w-[35%] min-w-[110px] md:min-w-0 aspect-[3/4] rounded-[5px] overflow-hidden rotate-[3deg] z-20 mb-[100px]">
              <Image src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800" alt="Gallery 2" fill className="object-cover" />
            </motion.div>

            {/* Card 3 */}
            <motion.div style={{ y: img3Y }} className="relative w-[30%] min-w-[100px] md:min-w-0 aspect-[3/4] rounded-[5px] overflow-hidden rotate-[-4deg] mt-[50px]">
              <Image src="https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&q=80&w=800" alt="Gallery 3" fill className="object-cover" />
            </motion.div>
          </div>
        </div>
        {/* Coral CTA Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className='bg-[var(--color-olive-green)] text-[var(--color-warm-black)] py-[80px] px-[29px] flex flex-col items-center justify-center text-center gap-[25px] relative z-10'
        >
          <p className="text-[13px] uppercase tracking-[0.2em] font-medium opacity-70">Ready to glow?</p>
          <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[36px] md:text-[72px] leading-[0.95] italic max-w-[700px]">
            Your journey to radiance starts here
          </h2>
          <button className="mt-[10px] bg-[var(--color-warm-black)] text-white font-medium text-[15px] px-[33px] py-[15px] rounded-[5px] hover:opacity-90 transition-opacity">
            BOOK YOUR APPOINTMENT
          </button>
        </motion.div>
      </section>

      {/* Contact & Newsletter */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="py-[100px] px-[29px] bg-[var(--color-warm-black)] text-[var(--color-creamy-white)] relative z-10"
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[67px]">
          <div>
            <p className="text-[13px] uppercase tracking-[0.2em] opacity-50 mb-[17px]">Stay in the loop</p>
            <h2 className="font-[family-name:var(--font-cardinal-fruit)] text-[42px] md:text-[54px] leading-[1] tracking-tight mb-[33px] italic">
              Get the Newsletter
            </h2>
            <p className="text-[15px] leading-[1.5] opacity-70 mb-[25px] max-w-[440px]">
              Be the first to hear about new treatments, exclusive offers, and insider beauty tips — delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-[10px] max-w-[440px]">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent border border-[var(--color-creamy-white)]/30 rounded-[5px] px-[17px] py-[13px] text-[15px] outline-none placeholder:text-[var(--color-creamy-white)]/40 focus:border-[var(--color-creamy-white)] transition-colors"
              />
              <button className="bg-[var(--color-olive-green)] text-[var(--color-warm-black)] font-medium text-[15px] px-[25px] py-[13px] rounded-[5px] hover:opacity-90 transition-opacity shrink-0">
                Subscribe
              </button>
            </div>
          </div>
          <div className="flex flex-col md:items-end justify-between gap-[33px]">
            <div className="flex flex-col md:items-end gap-[8px]">
              <p className="text-[13px] uppercase tracking-[0.2em] opacity-50 mb-[10px]">Get in touch</p>
              <a href="tel:01273040333" className="text-[22px] md:text-[28px] font-medium hover:text-[var(--color-olive-green)] transition-colors">01273 040 333</a>
              <a href="mailto:info@daviniadevine.com" className="text-[15px] font-medium opacity-70 hover:opacity-100 transition-opacity border-b border-[var(--color-creamy-white)]/30 pb-[2px]">INFO@DAVINIADEVINE.COM</a>
            </div>
            <div className="flex flex-col md:items-end gap-[8px]">
              <p className="text-[13px] uppercase tracking-[0.2em] opacity-50 mb-[6px]">Follow us</p>
              <div className="flex gap-[17px] text-[13px] font-medium">
                <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">INSTAGRAM</a>
                <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">FACEBOOK</a>
                <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">TIKTOK</a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-[17px]"
          onClick={() => !bookingConfirmed && setShowBookingModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[520px] bg-[var(--color-creamy-white)] rounded-[15px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)]"
          >
            {/* Modal Header */}
            <div className="bg-[var(--color-warm-black)] text-white px-[33px] py-[25px] relative">
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-[17px] right-[17px] text-white/50 hover:text-white transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-[8px]">Complete your booking</p>
              <h3 className="font-[family-name:var(--font-cardinal-fruit)] text-[28px] italic leading-[1.1]">
                Almost there...
              </h3>
            </div>

            {bookingConfirmed ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="px-[33px] py-[50px] flex flex-col items-center text-center"
              >
                <div className="w-[70px] h-[70px] rounded-full bg-[var(--color-olive-green)]/15 flex items-center justify-center mb-[25px]">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Check size={32} strokeWidth={2} className="text-[var(--color-olive-green)]" />
                  </motion.div>
                </div>
                <h4 className="text-[22px] font-medium mb-[8px]">Booking Confirmed!</h4>
                <p className="text-[15px] opacity-60 max-w-[320px]">
                  We&apos;ve sent a confirmation to <span className="font-medium opacity-100">{bookingEmail}</span>. See you soon!
                </p>
              </motion.div>
            ) : (
              /* Form */
              <div className="px-[33px] py-[29px]">
                {/* Booking Summary */}
                <div className="bg-[var(--color-stone)]/50 rounded-[10px] p-[17px] mb-[25px]">
                  <p className="text-[11px] uppercase tracking-[0.15em] opacity-50 mb-[10px] font-medium">Booking summary</p>
                  <div className="space-y-[6px]">
                    <div className="flex justify-between text-[14px]">
                      <span className="opacity-60">Service</span>
                      <span className="font-medium text-right max-w-[250px] truncate">{selectedService}</span>
                    </div>
                    <div className="flex justify-between text-[14px]">
                      <span className="opacity-60">Date</span>
                      <span className="font-medium">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    {selectedServiceData && (
                      <div className="flex justify-between text-[14px]">
                        <span className="opacity-60">Duration</span>
                        <span className="font-medium">{selectedServiceData.duration}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[14px]">
                      <span className="opacity-60">Guests</span>
                      <span className="font-medium">{guests}</span>
                    </div>
                    {selectedServiceData && (
                      <div className="flex justify-between text-[14px] pt-[6px] border-t border-[var(--color-stone)]">
                        <span className="opacity-60">From</span>
                        <span className="font-medium text-[var(--color-olive-green)]">{selectedServiceData.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-[13px] mb-[25px]">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] opacity-50 font-medium block mb-[6px]">Full Name</label>
                    <input
                      type="text"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full bg-transparent border border-[var(--color-stone)] rounded-[7px] px-[17px] py-[13px] text-[15px] outline-none focus:border-[var(--color-warm-black)] transition-colors placeholder:opacity-30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] opacity-50 font-medium block mb-[6px]">Email Address</label>
                    <input
                      type="email"
                      value={bookingEmail}
                      onChange={(e) => setBookingEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full bg-transparent border border-[var(--color-stone)] rounded-[7px] px-[17px] py-[13px] text-[15px] outline-none focus:border-[var(--color-warm-black)] transition-colors placeholder:opacity-30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] opacity-50 font-medium block mb-[6px]">Phone Number</label>
                    <input
                      type="tel"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="+44 7700 000 000"
                      className="w-full bg-transparent border border-[var(--color-stone)] rounded-[7px] px-[17px] py-[13px] text-[15px] outline-none focus:border-[var(--color-warm-black)] transition-colors placeholder:opacity-30"
                    />
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={!bookingName || !bookingEmail || !bookingPhone}
                  className={`w-full py-[15px] rounded-[7px] font-medium text-[15px] transition-all duration-300 flex items-center justify-center gap-[8px] ${bookingName && bookingEmail && bookingPhone
                      ? 'bg-[var(--color-warm-black)] text-white hover:opacity-90'
                      : 'bg-[var(--color-stone)] text-[var(--color-warm-black)]/30 cursor-not-allowed'
                    }`}
                >
                  CONFIRM BOOKING
                  <ArrowRight size={16} strokeWidth={2} />
                </button>

                <p className="text-[12px] text-center opacity-40 mt-[13px]">
                  By confirming, you agree to our cancellation policy. You can reschedule up to 24h before your appointment.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

    </main>
  );
}
