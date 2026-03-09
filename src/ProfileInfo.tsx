import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
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

  const [airtableToken, setAirtableToken] = useState('');
  const [gammaKey, setGammaKey] = useState('');
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
        setAirtableToken(data.airtable_token || '');
        setGammaKey(data.gamma_api_key || '');
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
        body: JSON.stringify({ userId: user.id, airtableToken, gammaKey }),
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
                Airtable Personal Access Token
              </label>
              <input
                type="password"
                value={airtableToken}
                onChange={(e) => setAirtableToken(e.target.value)}
                placeholder="patXXXXXXXXXXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5">
                Create at{' '}
                <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-violet-400/70 hover:text-violet-400 inline-flex items-center gap-0.5">
                  airtable.com/create/tokens <Link2 className="w-3 h-3" />
                </a>
                {' '}— needs <code className="text-xs bg-white/10 px-1 rounded">data.records:write</code> and <code className="text-xs bg-white/10 px-1 rounded">schema.bases:write</code>
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                <Key className="w-3.5 h-3.5 text-violet-400" />
                Gamma API Key
              </label>
              <input
                type="password"
                value={gammaKey}
                onChange={(e) => setGammaKey(e.target.value)}
                placeholder="gamma_XXXXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              />
              <p className="text-xs text-white/25 mt-1.5">
                Available on Gamma Pro+ plans at{' '}
                <a href="https://gamma.app/settings/api" target="_blank" rel="noopener noreferrer" className="text-violet-400/70 hover:text-violet-400 inline-flex items-center gap-0.5">
                  gamma.app/settings/api <Link2 className="w-3 h-3" />
                </a>
              </p>
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
