'use client';

import Reveal from './reveal';

const features = [
  { icon: '\u{1F4F8}', title: 'Portfolio', desc: 'Showcase your best work with beautiful image galleries' },
  { icon: '\u{1F484}', title: 'Services', desc: 'List every service with descriptions and pricing' },
  { icon: '\u{1F4B0}', title: 'Pricing', desc: 'Display transparent pricing your clients will appreciate' },
  { icon: '\u{1F4C5}', title: 'Availability', desc: 'Let clients see your available dates instantly' },
  { icon: '\u{2B50}', title: 'Testimonials', desc: 'Feature glowing reviews from happy brides' },
  { icon: '\u{1F4DE}', title: 'Contact', desc: 'Make it easy for clients to reach you' },
  { icon: '\u{1F4C6}', title: 'Google Calendar', desc: 'Sync your calendar and never double-book' },
  { icon: '\u{1F4AC}', title: 'WhatsApp', desc: 'Let clients message you with one tap' },
];

export default function SolutionSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-section text-balance mb-4 text-center leading-tight">
            Everything Your Clients Need. One Beautiful Website.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-body text-balance mb-14 text-center text-warm-gray">
            Showcase everything that matters &mdash; in a single, elegant link.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} direction="up">
              <div className="card-shadow group rounded-2xl bg-white p-6 transition-all duration-500 ease-out-expo hover:card-shadow-hover hover:-translate-y-1">
                <span className="mb-3 block text-2xl">{f.icon}</span>
                <h3 className="font-serif text-subsection mb-1.5 font-semibold leading-tight">
                  {f.title}
                </h3>
                <p className="text-small text-warm-gray leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
