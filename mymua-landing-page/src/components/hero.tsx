'use client';

import { motion } from 'framer-motion';
import PhoneMockup from './phone-mockup';

const EASE = [0.16, 1, 0.3, 1] as const;

const floatKeyframes = `
@keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
@keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
@keyframes float3 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-7px); } }
@keyframes float4 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
.floating-card-1 { animation: float1 7s ease-in-out infinite; }
.floating-card-2 { animation: float2 5s ease-in-out infinite 1.5s; }
.floating-card-3 { animation: float3 6.5s ease-in-out infinite 0.8s; }
.floating-card-4 { animation: float4 4.8s ease-in-out infinite 2.2s; }
`;

const cards = [
  { label: 'Portfolio', sub: '12 projects', className: 'floating-card-1 top-4 -left-14 md:-left-20', icon: '◻' },
  { label: 'Availability', sub: 'This weekend', className: 'floating-card-2 top-4 -right-14 md:-right-20', icon: '◷' },
  { label: 'Calendar', sub: 'Google Sync', className: 'floating-card-3 bottom-4 -left-14 md:-left-20', icon: '◰' },
  { label: 'Services', sub: '5 offerings', className: 'floating-card-4 bottom-4 -right-14 md:-right-20', icon: '◶' },
];

function FloatCard({ label, sub, className, icon }: typeof cards[number]) {
  return (
    <div
      className={`absolute z-10 hidden w-[100px] rounded-xl bg-white/90 px-3 py-2.5 shadow-[0_2px_16px_rgba(26,26,26,0.06)] backdrop-blur-sm md:block ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-warm-gray">{icon}</span>
        <span className="text-[10px] font-medium text-near-black">{label}</span>
      </div>
      <p className="mt-0.5 text-[8px] text-warm-gray/70">{sub}</p>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-cream pt-28 md:pt-36">
      <style>{floatKeyframes}</style>

      <div className="radial-glow pointer-events-none absolute inset-0" />
      <div className="bg-grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 md:grid md:grid-cols-2 md:gap-16 md:px-6 lg:px-8">
        <div className="flex flex-col justify-center pt-4 md:pt-0">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            className="font-serif text-hero text-balance leading-tight text-near-black"
          >
            Your Makeup Brand Starts Here.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
            className="text-body text-balance mt-5 leading-relaxed text-warm-gray md:mt-6"
          >
            Create a stunning website in minutes. Showcase your portfolio, services, pricing, availability, and booking details&mdash;all from a single link designed exclusively for makeup artists.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10"
          >
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl bg-near-black px-10 py-4 font-sans text-sm font-medium text-cream transition-all hover:bg-near-black/90 active:scale-[0.98]"
            >
              Start for ₹599
            </a>
            <a
              href="#templates"
              className="inline-flex items-center justify-center rounded-xl border border-near-black/15 px-10 py-4 font-sans text-sm font-medium text-near-black transition-all hover:border-near-black/30 hover:bg-near-black/[0.02] active:scale-[0.98]"
            >
              Explore Templates
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
            className="mt-6 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/[0.04] to-transparent px-4 py-3 md:mt-8"
          >
            <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-near-black/80">
              <span className="text-gold">&#10024;</span>
              <span className="font-medium">Founding Offer</span>
              <span className="text-warm-gray">&middot;</span>
              <span className="font-medium text-gold">₹599/year</span>
              <span className="text-warm-gray">&middot;</span>
              <span className="text-warm-gray">Only for the first 100 Makeup Artists.</span>
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.8 }}
          className="relative flex items-center justify-center py-6 md:py-0"
        >
          <div className="relative">
            <FloatCard {...cards[0]} />
            <FloatCard {...cards[1]} />
            <FloatCard {...cards[2]} />
            <FloatCard {...cards[3]} />
            <PhoneMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
