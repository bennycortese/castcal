import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './@/components/ui/button';
import { useUser, UserButton } from '@clerk/react';
import { useNotionAuth } from './hooks';
import { Zap } from 'lucide-react';

export const NavBar: React.FC = () => {
  const { user } = useUser();
  const notionAuth = useNotionAuth(user);

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 1px 0 0 rgba(139,92,246,0.08)' }}>
      <div className="container mx-auto flex justify-between items-center h-16 px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-violet-600 flex items-center justify-center shadow-[0_2px_12px_rgba(124,58,237,0.3)]">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
              Castcal
            </span>
          </Link>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border border-white/8 bg-white/[0.035] text-white/35 tracking-widest uppercase">
            Early access
          </span>
        </div>

        <nav className="flex items-center gap-2">
          {user && <UserButton afterSignOutUrl="/" />}
          {user && (
            <Link to="/profile">
              <Button variant="nav" size="sm">Profile</Button>
            </Link>
          )}
          {user && (
            <Link to="/login">
              <Button variant="nav" size="sm">Connect Notion</Button>
            </Link>
          )}
          {!user && (
            <Link to="/login">
              <Button variant="nav" size="sm">Sign in</Button>
            </Link>
          )}
          <Link to={(!user || !notionAuth) ? '/login' : '/create'}>
            <Button variant="primary" size="sm">
              {user && notionAuth ? 'Open App' : 'Get started'}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
