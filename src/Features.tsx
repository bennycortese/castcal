import React from 'react';
import { FileText, Send, Repeat2, Zap } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-5 h-5 text-violet-400" />,
    title: 'Paste anything',
    description:
      'Drop in a marketing brief, campaign doc, keyword list, or upload a PDF or DOCX. Castcal handles the parsing.',
  },
  {
    icon: <Zap className="w-5 h-5 text-violet-400" />,
    title: 'Claude extracts the plan',
    description:
      'Claude claude-sonnet-4-6 reads your brief and structures every content idea — title, hook, channel, format, publish date, and description.',
  },
  {
    icon: <Send className="w-5 h-5 text-violet-400" />,
    title: 'Deliver to your stack',
    description:
      'Push structured content calendars to Notion, Airtable, or Gamma in one click. Your team gets a live, editable doc immediately.',
  },
  {
    icon: <Repeat2 className="w-5 h-5 text-violet-400" />,
    title: 'Built for agencies',
    description:
      'Run it once per client brief. Every channel, every format, every hook — already organized and ready to assign.',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            From brief to calendar in{' '}
            <span className="gradient-text">seconds</span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto">
            Stop copying content ideas into spreadsheets. Let AI do the structural work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-6 hover:border-white/15 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
