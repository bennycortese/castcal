import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { generatedCalendarAtom, ContentItem } from './atoms';
import { NavBar } from './Navbar';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useUserIntegrations } from './hooks';
import { Check, ArrowLeft, Loader2, ExternalLink, Send } from 'lucide-react';
import { Button } from './@/components/ui/button';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CHANNEL_BADGE: Record<string, string> = {
  Instagram:  'bg-pink-500/10 text-pink-400 border-pink-500/20',
  LinkedIn:   'bg-sky-500/10 text-sky-400 border-sky-500/20',
  X:          'bg-white/5 text-white/45 border-white/10',
  YouTube:    'bg-red-500/10 text-red-400 border-red-500/20',
  Newsletter: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Blog:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const SERVICE_LABEL: Record<string, string> = {
  twitter: 'X', linkedin: 'in', instagram: 'IG', facebook: 'fb',
  pinterest: 'Pi', tiktok: 'TT', mastodon: 'Ma', youtube: 'YT',
};

function fmtDate(d: string) {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return d; }
}

const PostCard: React.FC<{
  item: ContentItem;
  approved: boolean;
  onToggle: () => void;
}> = ({ item, approved, onToggle }) => {
  const badge = CHANNEL_BADGE[item.channel] || CHANNEL_BADGE.Blog;
  return (
    <button
      onClick={onToggle}
      className={`relative w-full text-left rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 ${
        approved
          ? 'bg-violet-500/[0.07] border border-violet-500/30 shadow-md shadow-violet-500/5'
          : 'glass-card opacity-35 hover:opacity-55'
      }`}
    >
      {/* Top: badges + checkbox */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`font-mono-feature text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge}`}>
            {item.channel}
          </span>
          <span className="font-mono-feature text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-white/35 border border-white/8">
            {item.format}
          </span>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
          approved ? 'bg-violet-500 border-violet-500' : 'border-white/20'
        }`}>
          {approved && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      </div>

      {/* Date */}
      {item.publish_date && item.publish_date !== 'NONE' && (
        <p className="font-mono-feature text-[11px] text-white/28 -mt-1">
          {fmtDate(item.publish_date)}
        </p>
      )}

      {/* Title */}
      <p className="text-sm font-semibold text-white leading-snug">
        {item.emoji} {item.title}
      </p>

      {/* Hook preview */}
      <p className="text-xs text-white/40 leading-relaxed line-clamp-3 italic">
        &ldquo;{item.hook}&rdquo;
      </p>
    </button>
  );
};

type BufferProfile = { id: string; service: string; formatted_username: string };
type BufferState = 'idle' | 'loading' | 'picking' | 'pushing' | 'done' | 'error';
type SecondaryState = 'idle' | 'pushing' | 'done' | 'error';

const ReviewPage: React.FC = () => {
  const calendar = useAtomValue(generatedCalendarAtom);
  const navigate = useNavigate();
  const { user } = useUser();
  const integrations = useUserIntegrations(user);

  const [approved, setApproved] = useState<Set<number>>(new Set());

  // Buffer state
  const [bufferState, setBufferState] = useState<BufferState>('idle');
  const [bufferProfiles, setBufferProfiles] = useState<BufferProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [bufferResult, setBufferResult] = useState<{ pushed: number; total: number } | null>(null);

  // Secondary export state
  const [secState, setSecState] = useState<Record<string, SecondaryState>>({});
  const [secLinks, setSecLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (calendar) {
      setApproved(new Set(calendar.items.map((_, i) => i)));
    }
  }, [calendar]);

  if (!calendar) return <Navigate to="/create" replace />;

  const approvedItems = calendar.items.filter((_, i) => approved.has(i));
  const approvedCount = approvedItems.length;

  const toggleApproval = (i: number) =>
    setApproved(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const getToken = async () => {
    try { return await (window as any).__clerk?.session?.getToken?.() ?? null; }
    catch { return null; }
  };

  const authHeaders = async (): Promise<Record<string, string>> => {
    const token = await getToken();
    return token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' };
  };

  // ─── Buffer push ────────────────────────────────────────────────────────────

  const handleBufferClick = async () => {
    if (!integrations.buffer_access_token) { navigate('/profile'); return; }

    if (bufferState === 'idle') {
      setBufferState('loading');
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_URL}/api/buffer-profiles`, {
          method: 'POST', headers, credentials: 'include',
          body: JSON.stringify({ bufferToken: integrations.buffer_access_token }),
        });
        if (!res.ok) throw new Error('Bad token');
        const profiles = await res.json() as BufferProfile[];
        setBufferProfiles(profiles);
        setSelectedProfiles(new Set(profiles.map(p => p.id)));
        setBufferState('picking');
      } catch {
        setBufferState('error');
        setTimeout(() => setBufferState('idle'), 3000);
      }
      return;
    }

    if (bufferState === 'picking') {
      if (selectedProfiles.size === 0) return;
      setBufferState('pushing');
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_URL}/api/push-buffer`, {
          method: 'POST', headers, credentials: 'include',
          body: JSON.stringify({
            bufferToken: integrations.buffer_access_token,
            profileIds: Array.from(selectedProfiles),
            items: approvedItems,
          }),
        });
        const data = await res.json() as any;
        setBufferResult({ pushed: data.pushed ?? approvedCount, total: data.total ?? approvedCount });
        setBufferState('done');
      } catch {
        setBufferState('error');
        setTimeout(() => setBufferState('picking'), 3000);
      }
    }
  };

  // ─── Secondary exports ──────────────────────────────────────────────────────

  const pushSecondary = async (dest: string) => {
    if (secState[dest] === 'pushing') return;
    setSecState(prev => ({ ...prev, [dest]: 'pushing' }));
    try {
      const headers = await authHeaders();
      let res: Response | undefined;
      if (dest === 'hubspot' && integrations.hubspot_token) {
        res = await fetch(`${API_URL}/api/push-hubspot`, {
          method: 'POST', headers, credentials: 'include',
          body: JSON.stringify({ hubspotToken: integrations.hubspot_token, title: calendar.calendar_title, items: approvedItems }),
        });
      } else if (dest === 'monday' && integrations.monday_token && integrations.monday_board_id) {
        res = await fetch(`${API_URL}/api/push-monday`, {
          method: 'POST', headers, credentials: 'include',
          body: JSON.stringify({ mondayToken: integrations.monday_token, mondayBoardId: integrations.monday_board_id, title: calendar.calendar_title, items: approvedItems }),
        });
      } else if (dest === 'trello' && integrations.trello_api_key && integrations.trello_token) {
        res = await fetch(`${API_URL}/api/push-trello`, {
          method: 'POST', headers, credentials: 'include',
          body: JSON.stringify({ trelloApiKey: integrations.trello_api_key, trelloToken: integrations.trello_token, title: calendar.calendar_title, items: approvedItems }),
        });
      }
      if (res?.ok) {
        const data = await res.json() as any;
        if (data.link) setSecLinks(prev => ({ ...prev, [dest]: data.link }));
        setSecState(prev => ({ ...prev, [dest]: 'done' }));
      } else {
        setSecState(prev => ({ ...prev, [dest]: 'error' }));
      }
    } catch {
      setSecState(prev => ({ ...prev, [dest]: 'error' }));
    }
  };

  const SecBtn: React.FC<{ dest: string; label: string }> = ({ dest, label }) => {
    const state = secState[dest] || 'idle';
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => pushSecondary(dest)}
        disabled={state === 'pushing' || approvedCount === 0}
        className="gap-1.5 h-8 text-xs"
      >
        {state === 'pushing' && <Loader2 className="w-3 h-3 animate-spin" />}
        {state === 'done' && <Check className="w-3 h-3 text-green-400" />}
        {label}
        {state === 'done' && secLinks[dest] && (
          <a href={secLinks[dest]} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </Button>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <NavBar />

      <main className="flex-grow container mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to brief
            </button>
            <h1 className="text-2xl font-bold text-white mb-1">{calendar.calendar_title}</h1>
            <p className="text-sm text-white/40">{calendar.items.length} posts generated</p>
          </div>

          <div className="flex items-center gap-3 pt-8">
            <button
              onClick={() => setApproved(new Set(calendar.items.map((_, i) => i)))}
              className="text-xs text-white/35 hover:text-white/60 transition-colors"
            >
              Select all
            </button>
            <span className="text-white/15 text-xs">·</span>
            <button
              onClick={() => setApproved(new Set())}
              className="text-xs text-white/35 hover:text-white/60 transition-colors"
            >
              Deselect all
            </button>
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {calendar.items.map((item, i) => (
            <PostCard
              key={i}
              item={item}
              approved={approved.has(i)}
              onToggle={() => toggleApproval(i)}
            />
          ))}
        </div>
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/[0.05] bg-background/90 backdrop-blur-sm">

        {/* Buffer profile picker — expands above the bar */}
        {bufferState === 'picking' && (
          <div className="border-t border-white/[0.05] px-6 py-4">
            <p className="text-xs font-semibold text-white/35 uppercase tracking-widest font-mono-feature mb-3">
              Push to which profiles?
            </p>
            <div className="flex flex-wrap gap-2">
              {bufferProfiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() =>
                    setSelectedProfiles(prev => {
                      const next = new Set(prev);
                      next.has(profile.id) ? next.delete(profile.id) : next.add(profile.id);
                      return next;
                    })
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    selectedProfiles.has(profile.id)
                      ? 'bg-violet-500/10 border-violet-500/30 text-white'
                      : 'glass-card text-white/40 hover:text-white/60'
                  }`}
                >
                  <span className="font-mono-feature text-[10px] font-bold uppercase text-violet-400">
                    {SERVICE_LABEL[profile.service] || profile.service.slice(0, 2).toUpperCase()}
                  </span>
                  {profile.formatted_username}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buffer done result */}
        {bufferState === 'done' && bufferResult && (
          <div className="px-6 py-2.5 bg-green-500/5 border-t border-green-500/10">
            <p className="text-sm text-green-400">
              <Check className="inline w-3.5 h-3.5 mr-1.5 mb-0.5" />
              {bufferResult.pushed} of {bufferResult.total} posts queued in Buffer
            </p>
          </div>
        )}

        {/* Buffer error */}
        {bufferState === 'error' && (
          <div className="px-6 py-2.5 bg-red-500/5 border-t border-red-500/10">
            <p className="text-sm text-red-400">Failed to connect to Buffer — check your token in Profile.</p>
          </div>
        )}

        {/* Main bar */}
        <div className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm text-white/40 flex-shrink-0">
            <span className="text-white font-semibold">{approvedCount}</span>
            <span className="text-white/30"> / {calendar.items.length} approved</span>
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Secondary exports — only shown if token configured */}
            {integrations.hubspot_token && <SecBtn dest="hubspot" label="HubSpot" />}
            {integrations.monday_token && integrations.monday_board_id && <SecBtn dest="monday" label="Monday" />}
            {integrations.trello_api_key && integrations.trello_token && <SecBtn dest="trello" label="Trello" />}

            {/* Buffer CTA */}
            <Button
              variant="primary"
              onClick={handleBufferClick}
              disabled={
                approvedCount === 0 ||
                bufferState === 'loading' ||
                bufferState === 'pushing' ||
                bufferState === 'done' ||
                (bufferState === 'picking' && selectedProfiles.size === 0)
              }
              className="gap-2 min-w-[190px] justify-center"
            >
              {bufferState === 'loading' || bufferState === 'pushing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {bufferState === 'loading' ? 'Loading profiles...' : 'Pushing to Buffer...'}
                </>
              ) : bufferState === 'picking' ? (
                <>
                  <Send className="w-4 h-4" />
                  Confirm &amp; push {approvedCount}
                </>
              ) : bufferState === 'done' ? (
                <>
                  <Check className="w-4 h-4" />
                  Done!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {integrations.buffer_access_token
                    ? `Push ${approvedCount} to Buffer`
                    : 'Connect Buffer'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
