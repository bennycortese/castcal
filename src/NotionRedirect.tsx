import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NotionRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [hasFetched, setHasFetched] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user || hasFetched) return;

    const storeUserId = async (notionAuthValue: string) => {
      const res = await fetch(`${API_URL}/api/store-user-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notionAuthValue }),
      });
      if (!res.ok) throw new Error('Failed to store user ID');
    };

    const fetchToken = async () => {
      setHasFetched(true);
      try {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) throw new Error('Authorization code not found');

        const res = await fetch(`${API_URL}/oauth/callback?code=${code}`);
        if (!res.ok) throw new Error('Failed to exchange code for token');

        const data = await res.json();
        await storeUserId(data['access_token']);
        navigate('/create');
      } catch (err) {
        console.error('OAuth error:', err);
        navigate('/error');
      }
    };

    fetchToken();
  }, [isLoaded, user, hasFetched, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="glass-card rounded-2xl p-8 text-center max-w-sm mx-4">
        <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-5" />
        <h1 className="text-xl font-semibold text-white mb-2">Connecting Notion</h1>
        <p className="text-sm text-white/40">Just a moment while we authorize your workspace.</p>
      </div>
    </div>
  );
};

export default NotionRedirect;
