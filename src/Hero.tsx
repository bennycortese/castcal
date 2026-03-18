import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { ArrowRight } from 'lucide-react';
import { ShimmerButton } from './@/components/magic/shimmer-button';
import { Button } from './@/components/ui/button';

const PLATFORMS = ['Airtable', 'Google Sheets', 'Slack', 'HubSpot', 'Monday.com', 'Trello'];

export const Hero: React.FC = () => {
  const { user } = useUser();

  return (
    <section className="relative flex flex-col items-center justify-center text-center py-32 px-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid-lines pointer-events-none" />
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/[0.06] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <div className="mb-10">
          <span className="font-mono-feature inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium border border-indigo-500/25 bg-indigo-500/8 text-indigo-400 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Powered by Claude Sonnet
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.06] tracking-tight text-white mb-6 text-balance">
          Turn any brief into a{' '}
          <span className="gradient-text">content calendar</span>
        </h1>

        <p className="text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed">
          Paste a brief, campaign doc, or strategy — Castcal extracts every content idea and delivers it to the tools your team already uses.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-14">
          <Link to={user ? '/create' : '/login'}>
            <ShimmerButton>
              Get started free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </ShimmerButton>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              See how it works
            </Button>
          </Link>
        </div>

        <p className="font-mono-feature text-[11px] text-white/22 tracking-wide mb-10">
          No credit card required · Free to start
        </p>

        <div className="w-full border-t border-white/[0.05] pt-8">
          <p className="font-mono-feature text-[10px] uppercase tracking-widest text-white/25 mb-5">
            Exports to
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {PLATFORMS.map((p) => (
              <span
                key={p}
                className="font-mono-feature px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.07] text-white/40 tracking-wide"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
