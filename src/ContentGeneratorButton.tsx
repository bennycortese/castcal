import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { generatingStateAtom, generatedCalendarAtom } from './atoms';
import { useCurrentMonthCount, useMaxMonthCount, useStripeSubscription } from './hooks';
import { useUser } from '@clerk/react';
import { Sparkles, Loader2 } from 'lucide-react';
import { ShimmerButton } from './@/components/magic/shimmer-button';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ContentGeneratorButton: React.FC<{ editorContent: string }> = ({ editorContent }) => {
  const [generatingState, setGeneratingState] = useAtom(generatingStateAtom);
  const setGeneratedCalendar = useSetAtom(generatedCalendarAtom);
  const { user } = useUser();
  const monthUsage = useCurrentMonthCount(user);
  const monthMaxUsage = useMaxMonthCount(user);
  const stripeSubscription = useStripeSubscription(user);
  const navigate = useNavigate();

  const getToken = () =>
    (window as any).__clerk?.session?.getToken?.() as Promise<string | null> | undefined;

  const authHeaders = async (): Promise<Record<string, string>> => {
    try {
      const token = await getToken();
      if (token) return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    } catch {}
    return { 'Content-Type': 'application/json' };
  };

  const handleGenerate = async () => {
    if (!editorContent.trim()) return;
    const freeLimit = monthMaxUsage ?? 3;
    const proLimit = (monthMaxUsage ?? 3) * 50;
    if (monthUsage !== null && monthMaxUsage !== null) {
      if (!stripeSubscription && monthUsage >= freeLimit) { setGeneratingState('limit_exceeded'); return; }
      if (stripeSubscription && monthUsage >= proLimit) { setGeneratingState('limit_exceeded'); return; }
    }

    setGeneratingState('generating');
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/api/claude-content`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ content: editorContent }),
      });
      if (!res.ok) throw new Error('Failed to generate content');
      const data = await res.json();
      setGeneratedCalendar(data);

      await fetch(`${API_URL}/api/increment-usage`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ editorContent }),
      });

      setGeneratingState('idle');
      navigate('/review');
    } catch (err) {
      console.error(err);
      setGeneratingState('error');
    }
  };

  const isGenerating = generatingState === 'generating';

  return (
    <ShimmerButton
      onClick={handleGenerate}
      disabled={isGenerating || !editorContent.trim()}
      className="w-full justify-center"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating calendar...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Generate &amp; Review
        </>
      )}
    </ShimmerButton>
  );
};

export default ContentGeneratorButton;
