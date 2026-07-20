'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from './reveal';

const FAQ_ITEMS = [
  {
    q: 'Can I use my own domain?',
    a: 'Yes! Founding members get free custom domain support. You can connect your own domain (like yourname.com) or use your free username.mymua.in subdomain.',
  },
  {
    q: 'Can I switch templates anytime?',
    a: 'Absolutely. You can switch between any template with one click — as many times as you want. Your content stays intact.',
  },
  {
    q: 'Will I lose my data when changing templates?',
    a: 'Never. Your portfolio, services, pricing, reviews, and all content remain exactly as you set them. Only the design changes.',
  },
  {
    q: 'How many templates are available?',
    a: 'We launch with 10 premium templates and add 2 new designs every week. Your membership includes all current and future templates.',
  },
  {
    q: 'Do you add new templates?',
    a: 'Yes — 2 new templates every week. Each design is crafted specifically for makeup artists, covering different styles from bridal to editorial.',
  },
  {
    q: 'Can I connect Google Calendar?',
    a: 'Yes. Sync your Google Calendar to automatically show your availability and prevent double-bookings.',
  },
  {
    q: 'Do I need coding knowledge?',
    a: 'None. MyMUA is built for makeup artists, not developers. Set up your website in minutes with zero coding.',
  },
  {
    q: 'Can clients book me directly?',
    a: 'Yes. Clients can see your availability, pricing, and book directly through your website. Inquiries come to you via WhatsApp and email.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center md:mb-16">
          <Reveal>
            <h2 className="font-serif text-section text-near-black mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-body text-warm-gray mx-auto max-w-xl">
              Everything you need to know about MyMUA.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto max-w-[720px]">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} direction="up" delay={Math.min(i * 0.05, 0.3)}>
              <div className="border-b border-near-black/10 last:border-0">
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-4 px-1 py-5 text-left text-sm font-medium text-near-black transition-colors hover:text-rose md:text-[15px]"
                >
                  <span>{item.q}</span>
                  <motion.span
                    animate={{ rotate: openIndex === i ? 135 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="shrink-0 text-warm-gray"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-1 pb-5 text-sm leading-relaxed text-warm-gray md:text-[15px]">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
