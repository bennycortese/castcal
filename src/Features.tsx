import React from 'react';
import { FileText, Send, Repeat2, Zap, Clock } from 'lucide-react';

const features = [
  {
    badge: 'Input',
    badgeClass: 'badge-emerald',
    icon: <FileText className="w-5 h-5 text-white/60" />,
    title: 'Paste anything',
    description:
      'Drop in a marketing brief, campaign doc, keyword list, or upload a PDF or DOCX. Castcal handles the parsing.',
  },
  {
    badge: 'AI',
    badgeClass: 'badge-orange',
    icon: <Zap className="w-5 h-5 text-white/60" />,
    title: 'Claude extracts the plan',
    description:
      'Claude Sonnet reads your brief and structures every content idea — title, hook, channel, format, publish date, and description.',
  },
  {
    badge: 'Export',
    badgeClass: 'badge-pink',
    icon: <Send className="w-5 h-5 text-white/60" />,
    title: 'Deliver to your stack',
    description:
      'Push posts directly to Buffer to queue them for publishing, or export your calendar to HubSpot, Monday.com, or Trello — in one click.',
  },
  {
    badge: 'Speed',
    badgeClass: 'badge-yellow',
    icon: <Clock className="w-5 h-5 text-white/60" />,
    title: 'Done in under a minute',
    description:
      'From paste to published calendar in seconds. No prompt engineering, no reformatting — just a complete plan ready to assign.',
  },
  {
    badge: 'Scale',
    badgeClass: 'badge-cyan',
    icon: <Repeat2 className="w-5 h-5 text-white/60" />,
    title: 'Built for agencies',
    description:
      'Run it once per client brief. Every channel, every format, every hook — already organized and ready to assign.',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 px-8 border-t border-white/[0.05]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="font-mono-feature text-[11px] uppercase tracking-widest text-white/30 mb-4">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            From brief to scheduled posts in{' '}
            <span className="gradient-text">seconds</span>
          </h2>
          <p className="text-white/40 max-w-lg">
            Stop copying content ideas into spreadsheets. Let AI do the structural work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05]">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-background p-8 relative group hover:bg-white/[0.018] transition-colors duration-200"
            >
              {/* Top indigo accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Multi-color category badge */}
              <span className={`font-mono-feature inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-5 ${f.badgeClass}`}>
                {f.badge}
              </span>

              <div className="w-10 h-10 rounded-lg border border-white/[0.07] bg-white/[0.04] flex items-center justify-center mb-4 group-hover:bg-white/[0.07] transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-white/90 mb-2">{f.title}</h3>
              <p className="text-sm text-white/38 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
