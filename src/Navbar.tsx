import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './@/components/ui/button';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useNotionAuth } from './hooks';
import { Zap } from 'lucide-react';

export const NavBar: React.FC = () => {
  const { user } = useUser();
  const notionAuth = useNotionAuth(user);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex justify-between items-center h-16 px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
            Castcal
          </span>
        </Link>

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
