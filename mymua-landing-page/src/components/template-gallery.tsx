'use client';

import { useRef, useState, useEffect } from 'react';
import Reveal from './reveal';

const temps = [
  { name: 'Luxury Black', bg: '#1A1A1A', text: '#FFFFFF', tag: 'Bridal' },
  { name: 'Soft Bridal', bg: '#F5E6E0', text: '#1A1A1A', tag: 'Bridal' },
  { name: 'Pink Beauty', bg: '#FDE8E8', text: '#1A1A1A', tag: 'Beauty' },
  { name: 'Minimal White', bg: '#FFFFFF', text: '#1A1A1A', tag: 'Minimal' },
  { name: 'Editorial', bg: '#2D2D2D', text: '#FFFFFF', tag: 'Editorial' },
  { name: 'Dark Glam', bg: '#1A1A1A', text: '#C9A96E', tag: 'Glam' },
];

export default function TemplateGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll(el.scrollWidth > el.clientWidth);
    const handle = () =>
      setCanScroll(el.scrollWidth > el.clientWidth);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-section text-balance mb-4 text-center leading-tight">
            Premium Templates. Constantly Growing.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-body text-balance mb-14 text-center text-warm-gray">
            Start with 10 professionally designed templates, with 2 new designs
            added every week.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.25}>
        <div className="relative">
          {canScroll && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent max-md:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent max-md:hidden" />
            </>
          )}

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 max-md:flex-col max-md:items-center max-md:overflow-visible max-md:px-6 md:px-[calc((100vw-72rem)/2+2rem)]"
            style={{ scrollbarWidth: 'none' }}
          >
            {temps.map((t, i) => (
              <div
                key={t.name}
                className="snap-start shrink-0 max-md:w-full md:w-[260px]"
              >
                <Reveal delay={i * 0.08} direction="up">
                  <div className="group card-shadow hover:card-shadow-hover rounded-2xl bg-white p-3 transition-all duration-500 ease-out-expo hover:-translate-y-1">
                    <div
                      className="relative mb-3 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl"
                      style={{ backgroundColor: t.bg }}
                    >
                      <span
                        className="font-serif text-lg font-semibold md:text-xl"
                        style={{ color: t.text }}
                      >
                        {t.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <p className="font-serif text-sm font-semibold text-near-black">
                        {t.name}
                      </p>
                      <span className="rounded-full bg-near-black/5 px-2.5 py-0.5 font-sans text-micro text-warm-gray">
                        {t.tag}
                      </span>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
