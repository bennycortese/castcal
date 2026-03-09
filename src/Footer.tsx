import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-12 bg-background">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="font-semibold text-white">Castcal</span>
        </div>

        <p className="text-sm text-white/30 text-center">
          Notion is a trademark of Notion Labs, Inc. Airtable is a trademark of Formagrid Inc.
        </p>

        <p className="text-sm text-white/30">&copy; {new Date().getFullYear()} Castcal. All rights reserved.</p>
      </div>
    </footer>
  );
};
