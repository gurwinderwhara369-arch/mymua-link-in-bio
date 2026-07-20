'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LINKS = ['Portfolio', 'Services', 'Pricing', 'Contact'];

function Slide1() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#0A0A0A] px-6 py-10">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A96E] bg-[#C9A96E]/10">
        <span className="font-serif text-sm text-[#C9A96E]">PS</span>
      </div>
      <h3 className="font-serif text-lg tracking-wide text-white">Priya Sharma</h3>
      <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#C9A96E]">Makeup Artist</p>
      <div className="mb-6 mt-5 h-px w-8 bg-[#C9A96E]/40" />
      <div className="flex w-full flex-col gap-2">
        {LINKS.map((l) => (
          <div key={l} className="rounded-lg border border-[#C9A96E]/30 px-4 py-2.5 text-center text-[11px] tracking-wide text-white transition-colors hover:bg-[#C9A96E]/10">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide2() {
  return (
    <div className="flex h-full flex-col items-center bg-[#FDF8F5] px-6 py-10">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#C4737A]/15">
        <span className="font-serif text-sm text-[#C4737A]">PS</span>
      </div>
      <h3 className="font-serif text-lg text-[#1A1A1A]">Priya Sharma</h3>
      <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-[#C4737A]">Makeup Artist</p>
      <div className="mb-5 mt-4 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#C4737A]/30" />
        ))}
      </div>
      <div className="flex w-full flex-col gap-2.5">
        {LINKS.map((l) => (
          <div key={l} className="rounded-full bg-[#C4737A]/10 px-4 py-2.5 text-center text-[11px] font-medium text-[#C4737A] transition-colors hover:bg-[#C4737A]/20">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide3() {
  return (
    <div className="flex h-full flex-col items-center bg-[#FFF5F5] px-6 py-10">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8A0A0]/20">
        <span className="font-sans text-sm font-semibold text-[#E8A0A0]">PS</span>
      </div>
      <h3 className="font-sans text-lg font-semibold text-[#1A1A1A]">Priya Sharma</h3>
      <p className="mt-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[#E8A0A0]">Makeup Artist</p>
      <div className="mb-5 mt-4 w-full border-t border-[#E8A0A0]/20" />
      <div className="flex w-full flex-col gap-2.5">
        {LINKS.map((l) => (
          <div key={l} className="rounded-full bg-[#E8A0A0] px-5 py-2.5 text-center text-[11px] font-medium text-white transition-colors hover:bg-[#E8A0A0]/80">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide4() {
  return (
    <div className="flex h-full flex-col items-center bg-white px-6 py-10">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#1A1A1A]/10">
        <span className="font-serif text-xs text-[#1A1A1A]/60">PS</span>
      </div>
      <h3 className="font-serif text-lg text-[#1A1A1A]">Priya Sharma</h3>
      <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-[#8C8C8C]">Makeup Artist</p>
      <div className="mb-5 mt-4 w-12 border-t border-[#1A1A1A]/10" />
      <div className="flex w-full flex-col gap-3">
        {LINKS.map((l) => (
          <div key={l} className="border-b border-[#1A1A1A]/8 px-4 pb-2.5 text-center text-[11px] tracking-wide text-[#1A1A1A]/70 transition-colors hover:text-[#1A1A1A]">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide5() {
  return (
    <div className="flex h-full flex-col bg-[#F5F5F5] px-6 py-10">
      <div className="mb-4 flex h-20 w-full items-end border-b-2 border-[#1A1A1A] pb-3">
        <div className="flex h-14 w-14 items-center justify-center bg-[#1A1A1A]">
          <span className="font-serif text-sm font-bold text-white">PS</span>
        </div>
      </div>
      <h3 className="font-serif text-2xl font-bold leading-tight text-[#1A1A1A]">Priya<br/>Sharma</h3>
      <p className="mt-1 font-sans text-[9px] font-semibold uppercase tracking-[0.25em] text-[#1A1A1A]/60">Makeup Artist</p>
      <div className="mb-4 mt-auto border-t-2 border-[#1A1A1A] pt-4">
        <div className="flex flex-col gap-2">
          {LINKS.map((l) => (
            <div key={l} className="bg-[#1A1A1A] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#1A1A1A]/90">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slide6() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-[#0D0D0D] px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_70%)]" />
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A68A4D] shadow-lg shadow-[#D4AF37]/20">
        <span className="font-serif text-sm font-bold text-[#0D0D0D]">PS</span>
      </div>
      <h3 className="relative font-serif text-lg tracking-wide text-white">Priya Sharma</h3>
      <p className="relative mt-1 font-sans text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">Makeup Artist</p>
      <div className="relative mb-6 mt-5 h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
      <div className="relative flex w-full flex-col gap-2.5">
        {LINKS.map((l) => (
          <div key={l} className="rounded-lg bg-gradient-to-r from-[#D4AF37]/15 to-[#D4AF37]/5 px-4 py-2.5 text-center text-[11px] tracking-wide text-[#D4AF37] ring-1 ring-[#D4AF37]/20 transition-colors hover:bg-[#D4AF37]/20">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6];

const NAMES = ['Luxury Black', 'Soft Bridal', 'Pink Beauty', 'Minimal White', 'Editorial', 'Dark Glam'];

export default function PhoneMockup() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const Slide = SLIDES[index];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="phone-frame relative mx-auto w-full max-w-[240px] md:max-w-[280px]"
      >
        <div className="relative aspect-[9/19] overflow-hidden rounded-[36px] bg-near-black md:rounded-[40px]">
          <div className="phone-notch" />
          <div className="absolute inset-0 overflow-hidden rounded-[34px] md:rounded-[38px]">
            <AnimatePresence>
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full"
              >
                <Slide />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="mt-5 flex items-center gap-2" role="tablist" aria-label="Template slides">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            role="tab"
            aria-selected={i === index}
            aria-label={`Template ${NAMES[i]}`}
            className={`h-1.5 rounded-full transition-all duration-500 ease-out-expo ${
              i === index ? 'w-6 bg-near-black' : 'w-1.5 bg-near-black/20 hover:bg-near-black/40'
            }`}
          />
        ))}
      </div>

      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.15em] text-warm-gray">
        {NAMES[index]}
      </p>
    </div>
  );
}
