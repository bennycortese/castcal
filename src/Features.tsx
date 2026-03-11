import React from 'react';
import { FileText, Send, Repeat2, Zap, Clock } from 'lucide-react';

const features = [
  {
    icon: <FileText className="w-5 h-5 text-indigo-500" />,
    title: 'Paste anything',
    description:
      'Drop in a marketing brief, campaign doc, keyword list, or upload a PDF or DOCX. Castcal handles the parsing.',
  },
  {
    icon: <Zap className="w-5 h-5 text-indigo-500" />,
    title: 'Claude extracts the plan',
    description:
      'Claude Sonnet reads your brief and structures every content idea — title, hook, channel, format, publish date, and description.',
  },
  {
    icon: <Send className="w-5 h-5 text-indigo-500" />,
    title: 'Deliver to your stack',
    description:
      'Push structured content calendars to Notion, Airtable, or Gamma in one click. Your team gets a live, editable doc immediately.',
  },
  {
    icon: <Clock className="w-5 h-5 text-indigo-500" />,
    title: 'Done in under a minute',
    description:
      'From paste to published calendar in seconds. No prompt engineering, no reformatting — just a complete plan ready to assign.',
  },
  {
    icon: <Repeat2 className="w-5 h-5 text-indigo-500" />,
    title: 'Built for agencies',
    description:
      'Run it once per client brief. Every channel, every format, every hook — already organized and ready to assign.',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-background border-t border-gray-100">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            From brief to calendar in{' '}
            <span className="gradient-text">seconds</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Stop copying content ideas into spreadsheets. Let AI do the structural work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-background p-7 relative group hover:bg-white transition-colors duration-200"
            >
              {/* Top accent line — indigo on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center mb-5 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
