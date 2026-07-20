'use client';

import { useState, useEffect, useCallback } from 'react';
import Reveal from './reveal';

const templates = [
  { name: 'Luxury Black', preview: '#1A1A1A' },
  { name: 'Soft Bridal', preview: '#F5E6E0' },
  { name: 'Minimal White', preview: '#FFFFFF' },
  { name: 'Dark Glam', preview: '#1A1A1A' },
];

export default function TemplateSwapSection() {
  const [active, setActive] = useState(0);
  const [morphing, setMorphing] = useState(false);

  const nextTemplate = useCallback(() => {
    setMorphing(true);
    setTimeout(() => {
      setActive((p) => (p + 1) % templates.length);
      setMorphing(false);
    }, 300);
  }, []);

  useEffect(() => {
    const id = setInterval(nextTemplate, 4000);
    return () => clearInterval(id);
  }, [nextTemplate]);

  return (
    <section className="border-y border-near-black/5 bg-white/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-section text-balance mb-4 text-center leading-tight">
            Switch Your Entire Website In One Click.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-body text-balance mb-14 text-center text-warm-gray">
            Same content. Completely different design. Every time.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <div className="phone-frame relative mb-6 h-[500px] w-[250px] overflow-hidden bg-white md:h-[560px] md:w-[280px]">
              <div className="phone-notch" />
              <div
                className={`flex h-full w-full items-center justify-center transition-all duration-500 ease-out-expo ${
                  morphing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{ backgroundColor: templates[active].preview }}
              >
                <span
                  className="font-serif text-lg font-semibold md:text-xl"
                  style={{
                    color:
                      active === 0 || active === 3 ? '#FFFFFF' : '#1A1A1A',
                  }}
                >
                  {templates[active].name}
                </span>
              </div>
            </div>

            <button
              onClick={nextTemplate}
              className="mb-8 cursor-pointer rounded-full bg-near-black px-6 py-2.5 font-sans text-sm font-medium text-white transition-all duration-500 ease-out-expo hover:bg-near-black/85"
            >
              Change Template
            </button>

            <p className="text-small text-balance mb-8 text-center font-medium text-near-black">
              {templates[active].name}
            </p>

            <div className="flex gap-3">
              {templates.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setMorphing(true);
                    setTimeout(() => {
                      setActive(i);
                      setMorphing(false);
                    }, 300);
                  }}
                  className={`h-10 w-10 cursor-pointer rounded-full ring-2 transition-all duration-500 ease-out-expo md:h-12 md:w-12 ${
                    i === active
                      ? 'scale-110 ring-gold shadow-lg shadow-gold/20'
                      : 'ring-transparent opacity-50 hover:opacity-80'
                  }`}
                  style={{ backgroundColor: t.preview }}
                  aria-label={t.name}
                />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="text-body text-balance mx-auto mt-16 max-w-2xl text-center leading-relaxed text-warm-gray">
            Unlike other platforms, MyMUA keeps your portfolio, services,
            pricing, reviews, and everything else intact. Only the design
            changes. Your data stays yours &mdash; always.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
