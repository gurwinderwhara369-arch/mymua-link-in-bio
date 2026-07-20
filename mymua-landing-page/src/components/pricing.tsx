'use client';

import { motion } from 'framer-motion';
import Reveal from './reveal';

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
    <circle cx="8" cy="8" r="8" fill="#C9A96E" fillOpacity="0.15" />
    <path d="M5 8.5L7 10.5L11 6" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FOUNDING_FEATURES = [
  'All current templates',
  'All future templates & updates',
  'AI Assistant Desk (when released)',
  'Custom domain support (when released)',
  'Priority support',
  'Lifetime founding member benefits',
];

const REGULAR_FEATURES = [
  'All current templates',
  'All future templates',
  'Standard support',
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center md:mb-14">
          <Reveal>
            <p className="mx-auto mb-3 inline-block rounded-full bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-wide text-gold md:text-sm">
              ✨ Only 47 spots remaining for founding members
            </p>
          </Reveal>
        </div>

        <div className="mx-auto flex max-w-3xl flex-col gap-6 md:flex-row md:gap-8">
          {/* Founding Member */}
          <Reveal className="flex-1" direction="up" delay={0.1}>
            <div className="relative flex flex-col rounded-2xl bg-white p-6 md:p-8 card-shadow-hover" style={{ boxShadow: '0 0 0 1px rgba(201, 169, 110, 0.3), 0 8px 40px rgba(26,26,26,0.06)' }}>
              <span className="absolute right-5 top-4 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold tracking-wider text-gold uppercase md:right-6 md:top-5">
                Best Value
              </span>

              <h3 className="font-serif text-xl text-near-black md:text-2xl">Founding Member</h3>

              <div className="mb-1 mt-4 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold text-near-black md:text-5xl">₹599</span>
                <span className="text-sm text-warm-gray">/year</span>
              </div>

              <p className="mb-6 text-sm text-rose md:text-[15px]">Limited to the first 100 makeup artists</p>

              <ul className="mb-8 flex flex-col gap-3">
                {FOUNDING_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-near-black/80 md:text-[15px]">
                    {CHECK_ICON}
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="flex w-full items-center justify-center rounded-xl bg-near-black px-6 py-3.5 text-sm font-medium text-cream transition-all hover:opacity-90"
              >
                Become a Founding Member
              </a>

              <p className="mt-3 text-center text-xs text-warm-gray">₹599/year · Lock in this price forever</p>
            </div>
          </Reveal>

          {/* Regular */}
          <Reveal className="flex-1" direction="up" delay={0.2}>
            <div className="flex flex-col rounded-2xl border border-near-black/10 bg-white p-6 md:p-8 card-shadow">
              <h3 className="font-serif text-lg text-near-black md:text-xl">Regular</h3>

              <div className="mb-1 mt-4 flex items-baseline gap-1">
                <span className="font-serif text-3xl font-semibold text-near-black md:text-4xl">₹149</span>
                <span className="text-sm text-warm-gray">/month</span>
              </div>

              <p className="mb-6 text-sm text-warm-gray md:text-[15px]">&nbsp;</p>

              <ul className="mb-8 flex flex-col gap-3">
                {REGULAR_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-near-black/70 md:text-[15px]">
                    {CHECK_ICON}
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="flex w-full items-center justify-center rounded-xl border border-near-black/20 bg-transparent px-6 py-3.5 text-sm font-medium text-near-black transition-all hover:bg-near-black/5"
              >
                Get Started
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
