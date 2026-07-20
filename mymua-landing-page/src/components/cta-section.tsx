'use client';

import Reveal from './reveal';

export default function CTASection() {
  return (
    <section className="bg-white/50 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Reveal>
          <h2 className="font-serif text-section text-near-black mb-5 text-balance">
            Give Your Makeup Brand The Website It Deserves.
          </h2>
          <p className="text-body text-warm-gray mb-8 mx-auto max-w-xl">
            Join 50+ makeup artists who have already elevated their brand. Start your premium website in under 2 minutes.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl bg-near-black px-8 py-3.5 text-sm font-medium text-cream transition-all hover:opacity-90"
            >
              Become A Founding Member
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl border border-near-black/20 bg-transparent px-8 py-3.5 text-sm font-medium text-near-black transition-all hover:bg-near-black/5"
            >
              Explore Templates
            </a>
          </div>
          <p className="mt-8 text-xs text-warm-gray tracking-wide">
            No coding required · Free updates · Cancel anytime
          </p>
        </Reveal>
      </div>
    </section>
  );
}
