'use client';

import Reveal from './reveal';

const artists = [
  { initials: 'PK', city: 'New Delhi' },
  { initials: 'RJ', city: 'Mumbai' },
  { initials: 'SM', city: 'Bangalore' },
  { initials: 'AK', city: 'Jaipur' },
  { initials: 'VP', city: 'Kolkata' },
];

export default function TrustBar() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="mb-10 text-center font-sans text-sm tracking-wider uppercase text-warm-gray">
            Trusted by Makeup Artists Across India
          </p>
        </Reveal>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {artists.map((a, i) => (
            <Reveal key={a.initials} delay={i * 0.08} direction="up">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 ring-1 ring-near-black/5 md:h-16 md:w-16">
                  <span className="font-serif text-sm font-semibold text-warm-gray md:text-base">
                    {a.initials}
                  </span>
                </div>
                <span className="text-micro text-warm-gray-light">{a.city}</span>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.4} direction="up">
            <div className="flex h-14 items-center rounded-full bg-rose/10 px-5 ring-1 ring-rose/20 md:h-16">
              <span className="whitespace-nowrap font-serif text-sm font-semibold text-rose md:text-base">
                50+ Makeup Artists
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
