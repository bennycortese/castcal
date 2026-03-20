import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { Button } from './@/components/ui/button';
import { useCurrentMonthCount, useMaxMonthCount, useStripeSubscription } from './hooks';
import { CheckCircle, Key, Link2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProfileInfo: React.FC = () => {
  const { user } = useUser();
  const monthUsage = useCurrentMonthCount(user);
  const monthMaxUsage = useMaxMonthCount(user);
  const stripeSubscription = useStripeSubscription(user);

  const [bufferAccessToken, setBufferAccessToken] = useState('');
  const [hubspotToken, setHubspotToken] = useState('');
  const [mondayToken, setMondayToken] = useState('');
  const [mondayBoardId, setMondayBoardId] = useState('');
  const [trelloApiKey, setTrelloApiKey] = useState('');
  const [trelloToken, setTrelloToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_URL}/api/user-integrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        setBufferAccessToken(data.buffer_access_token || '');
        setHubspotToken(data.hubspot_token || '');
        setMondayToken(data.monday_token || '');
        setMondayBoardId(data.monday_board_id || '');
        setTrelloApiKey(data.trello_api_key || '');
        setTrelloToken(data.trello_token || '');
      } catch { /* ignore */ }
    };
    fetchIntegrations();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/save-integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, bufferAccessToken, hubspotToken, mondayToken, mondayBoardId, trelloApiKey, trelloToken }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const limit = stripeSubscription ? (monthMaxUsage ?? 3) * 50 : (monthMaxUsage ?? 3);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <main className="flex-grow container mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

        {/* Usage card */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-5">Usage this month</h2>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold text-white">{monthUsage ?? '—'}</span>
            <span className="text-white/40 mb-1.5">/ {limit} exports</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all"
              style={{ width: `${Math.min(100, ((monthUsage ?? 0) / limit) * 100)}%` }}
            />
          </div>
          {stripeSubscription && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-green-400">
              <CheckCircle className="w-3.5 h-3.5" />
              Pro subscription active
            </div>
          )}
        </div>

        {/* Integrations card */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-5">Integrations</h2>

          <div className="flex flex-col gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                Buffer Access Token
              </label>
              <input
                type="password"
                value={bufferAccessToken}
                onChange={(e) => setBufferAccessToken(e.target.value)}
                placeholder="1/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5">
                Get at{' '}
                <a href="https://buffer.com/developers/api" target="_blank" rel="noopener noreferrer" className="text-violet-400/70 hover:text-violet-400 inline-flex items-center gap-0.5">
                  buffer.com/developers/api <Link2 className="w-3 h-3" />
                </a>
                {' '}→ create an app → copy the access token
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                HubSpot Private App Token
              </label>
              <input
                type="password"
                value={hubspotToken}
                onChange={(e) => setHubspotToken(e.target.value)}
                placeholder="pat-na1-XXXXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5">
                Create at{' '}
                <a href="https://app.hubspot.com/private-apps" target="_blank" rel="noopener noreferrer" className="text-violet-400/70 hover:text-violet-400 inline-flex items-center gap-0.5">
                  app.hubspot.com/private-apps <Link2 className="w-3 h-3" />
                </a>
                {' '}— needs <code className="text-xs bg-white/10 px-1 rounded">crm.objects.tasks:write</code>
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                Monday.com API Token
              </label>
              <input
                type="password"
                value={mondayToken}
                onChange={(e) => setMondayToken(e.target.value)}
                placeholder="eyJhbGci..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5">
                Find at{' '}
                <a href="https://monday.com/settings/profile/developer" target="_blank" rel="noopener noreferrer" className="text-violet-400/70 hover:text-violet-400 inline-flex items-center gap-0.5">
                  monday.com → Profile → Developer <Link2 className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                Monday.com Board ID
              </label>
              <input
                type="text"
                value={mondayBoardId}
                onChange={(e) => setMondayBoardId(e.target.value)}
                placeholder="1234567890"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5">Open your board → copy the number from the URL</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                Trello API Key
              </label>
              <input
                type="text"
                value={trelloApiKey}
                onChange={(e) => setTrelloApiKey(e.target.value)}
                placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5">
                Get at{' '}
                <a href="https://trello.com/power-ups/admin" target="_blank" rel="noopener noreferrer" className="text-violet-400/70 hover:text-violet-400 inline-flex items-center gap-0.5">
                  trello.com/power-ups/admin <Link2 className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                Trello Token
              </label>
              <input
                type="password"
                value={trelloToken}
                onChange={(e) => setTrelloToken(e.target.value)}
                placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5">After getting your API key, click "Token" on the same page to authorize</p>
            </div>

            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="self-start gap-2"
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : saving ? (
                'Saving...'
              ) : (
                'Save integrations'
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileInfo;
