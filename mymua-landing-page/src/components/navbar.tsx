'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Templates', href: '#templates' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-card/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <a href="#" className="font-serif text-xl text-near-black tracking-tight">
          MyMUA
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-warm-gray transition-colors hover:text-near-black"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <a href="#" className="text-sm text-warm-gray transition-colors hover:text-near-black">
            Login
          </a>
          <a
            href="#"
            className="rounded-full bg-near-black px-5 py-2.5 text-sm text-cream transition-opacity hover:opacity-90"
          >
            Start for ₹599
          </a>
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex size-10 items-center justify-center md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <div className="flex w-5 flex-col gap-1.5">
            <span
              className={`block h-0.5 w-full bg-near-black transition-transform duration-300 ${
                mobileOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-near-black transition-opacity duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-near-black transition-transform duration-300 ${
                mobileOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-0 border-t border-near-black/5 bg-card/95 backdrop-blur-xl px-4 pb-6 pt-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[48px] items-center text-sm text-warm-gray transition-colors hover:text-near-black"
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-2 border-near-black/5" />
              <a
                href="#"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[48px] items-center text-sm text-warm-gray transition-colors hover:text-near-black"
              >
                Login
              </a>
              <a
                href="#"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex min-h-[48px] items-center justify-center rounded-full bg-near-black text-sm text-cream transition-opacity hover:opacity-90"
              >
                Start for ₹599
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
