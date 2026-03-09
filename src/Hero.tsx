import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useNotionAuth } from './hooks';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ShimmerButton } from './@/components/magic/shimmer-button';
import { AnimatedGradientText } from './@/components/magic/animated-gradient-text';
import { Particles } from './@/components/magic/particles';

export const Hero: React.FC = () => {
  const { user } = useUser();
  const notionAuth = useNotionAuth(user);

  return (
    <section className="relative flex-grow flex flex-col items-center justify-center text-center py-28 px-6 overflow-hidden">
      {/* Ambient particles */}
      <Particles className="opacity-40" quantity={50} color="#7c3aed" />

      {/* Background glow blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-purple-700/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Animated badge */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <AnimatedGradientText>
            <Sparkles className="inline w-3 h-3 mr-1.5 -mt-0.5" />
            Powered by Claude claude-sonnet-4-6
          </AnimatedGradientText>
        </div>

        <h1
          className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          Turn any brief into a{' '}
          <span className="gradient-text">content calendar</span>
        </h1>

        <p
          className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          Paste a marketing brief, campaign doc, or strategy — Castcal extracts every content idea
          and delivers it directly to the tools your team already uses.
        </p>

        {/* Platform pills */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-up"
          style={{ animationDelay: '220ms' }}
        >
          {['Notion', 'Airtable', 'Gamma', 'Google Slides'].map((d) => (
            <span
              key={d}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/50"
            >
              {d}
            </span>
          ))}
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Link to={(!user || !notionAuth) ? '/login' : '/create'}>
            <ShimmerButton>
              Generate your first calendar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </section>
  );
};
