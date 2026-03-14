import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Connect your workspace',
    description: 'Sign in and authorize Notion with one click. Optionally add your Airtable token or Slack webhook.',
  },
  {
    number: '02',
    title: 'Paste your brief',
    description: 'Drop in a content strategy, campaign doc, or keyword list. Upload PDF or DOCX if needed.',
  },
  {
    number: '03',
    title: 'Choose your destinations',
    description: 'Pick Notion, Airtable, Google Sheets, or Slack — or all of them. Your calendar lands everywhere at once.',
  },
  {
    number: '04',
    title: 'Get a live calendar',
    description: 'Castcal creates the database with every post pre-structured: channel, format, hook, date, status.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 px-8 border-t border-white/[0.05]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="font-mono-feature text-[11px] uppercase tracking-widest text-white/30 mb-4">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Four steps, under a minute</h2>
          <p className="text-white/40">No prompt engineering. No reformatting. Just your calendar.</p>
        </div>

        {/* Desktop: horizontal row with connector line */}
        <div className="hidden md:grid md:grid-cols-4 relative">
          {/* Connector line */}
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-white/[0.06]" />

          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center text-center px-5">
              <div className="relative z-10 w-10 h-10 bg-background border border-white/10 rounded-lg flex items-center justify-center mb-5">
                <span className="font-mono-feature text-[11px] font-semibold text-indigo-400 tracking-wider">{s.number}</span>
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
              <div className="flex-shrink-0 w-10 h-10 bg-background border border-white/10 rounded-lg flex items-center justify-center">
                <span className="font-mono-feature text-[11px] font-semibold text-indigo-400 tracking-wider">{s.number}</span>
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
