import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './@/components/ui/button';
import { useUser, UserButton } from '@clerk/react';
import { Zap } from 'lucide-react';

export const NavBar: React.FC = () => {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center h-14 px-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_2px_12px_rgba(99,102,241,0.35)]">
              <Zap className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              Briefcast
            </span>
          </Link>
          <span className="font-mono-feature hidden md:inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold border border-indigo-500/25 bg-indigo-500/8 text-indigo-400 tracking-widest uppercase">
            Early access
          </span>
        </div>

        <nav className="flex items-center gap-1.5">
          {user && <UserButton afterSignOutUrl="/" />}
          {user && (
            <Link to="/profile">
              <Button variant="nav" size="sm">Profile</Button>
            </Link>
          )}
          {!user && (
            <Link to="/login">
              <Button variant="nav" size="sm">Sign in</Button>
            </Link>
          )}
          <Link to={user ? '/create' : '/login'}>
            <Button variant="primary" size="sm">
              {user ? 'Open App' : 'Get started'}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
