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
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-gray-200/70">
      <div className="container mx-auto flex justify-between items-center h-16 px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_2px_12px_rgba(79,70,229,0.25)]">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
              Castcal
            </span>
          </Link>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-indigo-200 bg-indigo-50 text-indigo-600 tracking-widest uppercase">
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
