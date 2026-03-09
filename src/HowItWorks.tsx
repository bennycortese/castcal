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
    <section className="py-24 px-6 border-t border-white/5">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-white/40">Four steps, under a minute.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {steps.map((s) => (
            <div key={s.number} className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-violet-400 font-mono">{s.number}</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1.5">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
