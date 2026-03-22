import React from 'react';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.05] py-10 bg-background">
      <div className="w-full max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" fill="white" />
          </div>
          <span className="font-semibold text-white/80 text-sm">Castcal</span>
        </div>

        <p className="text-xs text-white/22 font-mono-feature">&copy; {new Date().getFullYear()} Castcal</p>
      </div>
    </footer>
  );
};
