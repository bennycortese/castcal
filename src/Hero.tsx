import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useNotionAuth } from './hooks';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ShimmerButton } from './@/components/magic/shimmer-button';

export const Hero: React.FC = () => {
  const { user } = useUser();
  const notionAuth = useNotionAuth(user);

  return (
    <section className="relative flex-grow flex flex-col items-center justify-center text-center py-36 px-6 overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      {/* Atmospheric gradient orbs — indigo + violet, very low opacity */}
      <div className="absolute -top-40 -left-40 w-[700px] h-[500px] bg-indigo-400/[0.07] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[500px] h-[400px] bg-violet-400/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[250px] bg-blue-400/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-indigo-200 bg-indigo-50 text-indigo-600 tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            Powered by Claude Sonnet
          </span>
        </div>

        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.02] tracking-tight text-gray-900 mb-7 animate-fade-up text-balance"
          style={{ animationDelay: '80ms' }}
        >
          Turn any brief into a{' '}
          <span className="gradient-text">content calendar</span>
        </h1>

        <p
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          Paste a marketing brief, campaign doc, or strategy — Castcal extracts every content idea
          and delivers it directly to the tools your team already uses.
        </p>

        {/* Platform pills */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-up"
          style={{ animationDelay: '220ms' }}
        >
          {['Notion', 'Airtable', 'Gamma', 'Google Slides'].map((d) => (
            <span
              key={d}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-500 tracking-wide shadow-sm"
            >
              {d}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Link to={(!user || !notionAuth) ? '/login' : '/create'}>
            <ShimmerButton>
              Generate your first calendar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </ShimmerButton>
          </Link>
          <p className="text-xs text-gray-400 tracking-wide">No credit card required · Free to start</p>
        </div>
      </div>
    </section>
  );
};
