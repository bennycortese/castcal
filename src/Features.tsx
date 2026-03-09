import React from 'react';
import { FileText, Send, Repeat2, Zap, Clock } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-5 h-5 text-white/50" />,
    title: 'Paste anything',
    description:
      'Drop in a marketing brief, campaign doc, keyword list, or upload a PDF or DOCX. Castcal handles the parsing.',
  },
  {
    icon: <Zap className="w-5 h-5 text-white/50" />,
    title: 'Claude extracts the plan',
    description:
      'Claude Sonnet reads your brief and structures every content idea — title, hook, channel, format, publish date, and description.',
  },
  {
    icon: <Send className="w-5 h-5 text-white/50" />,
    title: 'Deliver to your stack',
    description:
      'Push structured content calendars to Notion, Airtable, or Gamma in one click. Your team gets a live, editable doc immediately.',
  },
  {
    icon: <Clock className="w-5 h-5 text-white/50" />,
    title: 'Done in under a minute',
    description:
      'From paste to published calendar in seconds. No prompt engineering, no reformatting — just a complete plan ready to assign.',
  },
  {
    icon: <Repeat2 className="w-5 h-5 text-white/50" />,
    title: 'Built for agencies',
    description:
      'Run it once per client brief. Every channel, every format, every hook — already organized and ready to assign.',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-background border-t border-white/[0.05]">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            From brief to calendar in{' '}
            <span className="gradient-text">seconds</span>
          </h2>
          <p className="text-white/38 max-w-lg mx-auto">
            Stop copying content ideas into spreadsheets. Let AI do the structural work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.055]">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-background p-7 relative group hover:bg-white/[0.022] transition-colors duration-200"
            >
              {/* Top accent line — violet appears only on hover as a micro-accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-10 h-10 rounded border border-white/[0.07] bg-white/[0.04] flex items-center justify-center mb-5 group-hover:bg-white/[0.07] transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-white/88 mb-2">{f.title}</h3>
              <p className="text-sm text-white/38 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
