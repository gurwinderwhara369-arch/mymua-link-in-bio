'use client';

import Reveal from './reveal';

const pains = [
  'Scattered information across posts',
  'Clients asking \u2018What are your prices?\u2019 every day',
  'No way to show availability',
  'Missed bookings from DMs',
  'Look unprofessional compared to others',
];

const steps = [
  { icon: '\u{1F4F7}', label: 'Instagram Profile' },
  { icon: '\u{1F517}', label: 'Link in Bio' },
  { icon: '\u{1F3E0}', label: 'Professional Website' },
  { icon: '\u{1F4B0}', label: 'More Bookings' },
];

export default function ProblemSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-section text-balance mb-16 text-center leading-tight">
            Instagram Was Never Meant To Be Your Website.
          </h2>
        </Reveal>

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="rounded-2xl bg-white/50 p-6 backdrop-blur-sm md:p-10">
            <Reveal direction="left">
              <ul className="space-y-5">
                {pains.map((p, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose/10 text-xs text-rose">
                      ✕
                    </span>
                    <span className="text-body text-near-black">{p}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="flex flex-col items-center justify-center">
            <Reveal direction="right">
              <div className="flex flex-col items-center gap-0">
                {steps.map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl md:h-20 md:w-20 ${
                        i === steps.length - 1
                          ? 'bg-rose text-white shadow-lg shadow-rose/20'
                          : 'bg-white text-2xl shadow-sm ring-1 ring-near-black/5'
                      }`}
                    >
                      <span className="text-xl md:text-2xl">{s.icon}</span>
                    </div>
                    <span
                      className={`mt-2 font-serif text-sm md:text-base ${
                        i === steps.length - 1 ? 'font-semibold text-rose' : 'text-warm-gray'
                      }`}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div className="my-1 flex flex-col items-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="text-warm-gray-light"
                        >
                          <path
                            d="M10 4v12m0 0l-4-4m4 4l4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
