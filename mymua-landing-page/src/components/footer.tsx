'use client';

import Reveal from './reveal';

const QUICK_LINKS = [
  { label: 'Templates', href: '#templates' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

const SOCIALS = [
  { label: 'Instagram', href: '#' },
  { label: 'YouTube', href: '#' },
  { label: 'Twitter / X', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-near-black/10 bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="flex flex-col items-center gap-8 text-center">
            <a href="#" className="font-serif text-2xl text-near-black tracking-tight">
              MyMUA
            </a>

            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-warm-gray transition-colors hover:text-near-black"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex gap-8">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="text-sm text-warm-gray transition-colors hover:text-near-black"
                >
                  {s.label}
                </a>
              ))}
            </div>

            <hr className="w-full max-w-xs border-near-black/10" />

            <p className="text-xs text-warm-gray">
              &copy; 2026 MyMUA. Built exclusively for makeup artists.
            </p>

            <div className="flex gap-6 text-xs text-warm-gray-light">
              <a href="#" className="transition-colors hover:text-warm-gray">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-warm-gray">Terms of Service</a>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
