import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Connect your workspace',
    description: 'Sign in and authorize Notion with one click. Optionally add your Airtable or Gamma API keys.',
  },
  {
    number: '02',
    title: 'Paste your brief',
    description: 'Drop in a content strategy, campaign doc, or keyword list. Upload PDF or DOCX if needed.',
  },
  {
    number: '03',
    title: 'Choose your destinations',
    description: 'Pick Notion, Airtable, or Gamma — or all three. Your calendar lands in every tool simultaneously.',
  },
  {
    number: '04',
    title: 'Get a live calendar',
    description: 'Castcal creates the database with every post pre-structured: channel, format, hook, date, status.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 px-6 border-t border-white/[0.05]">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-white/38">Four steps, under a minute.</p>
        </div>

        {/* Desktop: horizontal row with connector line */}
        <div className="hidden md:grid md:grid-cols-4 relative">
          {/* Connector */}
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-white/[0.06]" />

          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center text-center px-5">
              {/* Step number box — rectangular, neutral */}
              <div className="relative z-10 w-10 h-10 bg-background border border-white/10 flex items-center justify-center mb-5">
                <span className="text-[11px] font-semibold text-white/40 font-mono tracking-wider">{s.number}</span>
              </div>
              <h3 className="text-sm font-semibold text-white/85 mb-2">{s.title}</h3>
              <p className="text-xs text-white/35 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical list */}
        <div className="flex flex-col gap-8 md:hidden">
          {steps.map((s) => (
            <div key={s.number} className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 bg-background border border-white/10 flex items-center justify-center">
                <span className="text-[11px] font-semibold text-white/40 font-mono tracking-wider">{s.number}</span>
              </div>
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-white/85 mb-1.5">{s.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
