import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { generatingStateAtom, selectedDestinationsAtom, exportResultsAtom, ExportResult } from './atoms';
import { useCurrentMonthCount, useMaxMonthCount, useStripeSubscription } from './hooks';
import { useUser } from '@clerk/react';
import { Sparkles, Loader2 } from 'lucide-react';
import { ShimmerButton } from './@/components/magic/shimmer-button';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface ContentItem {
  title: string;
  channel: string;
  publish_date: string;
  status: string;
  format: string;
  hook: string;
  description: string;
  emoji: string;
}

interface ContentGeneratorButtonProps {
  editorContent: string;
  notionAuth: string;
  selectedPageId: string;
  userId: string;
  airtableToken: string | null;
  gammaKey: string | null;
}

const ContentGeneratorButton: React.FC<ContentGeneratorButtonProps> = ({
  editorContent,
  notionAuth,
  selectedPageId,
  userId,
  airtableToken,
  gammaKey,
}) => {
  const [generatingState, setGeneratingState] = useAtom(generatingStateAtom);
  const setExportResults = useSetAtom(exportResultsAtom);
  const selectedDestinations = useAtomValue(selectedDestinationsAtom);
  const { user } = useUser();
  const monthUsage = useCurrentMonthCount(user);
  const monthMaxUsage = useMaxMonthCount(user);
  const stripeSubscription = useStripeSubscription(user);

  const getToken = () => {
    // The Clerk session token is sent via cookie automatically; we retrieve it here for the Authorization header
    return (window as any).__clerk?.session?.getToken?.() as Promise<string | null> | undefined;
  };

  const authHeaders = async (): Promise<Record<string, string>> => {
    try {
      const token = await getToken();
      if (token) return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    } catch { /* fallback to no auth header — server will still verify cookie */ }
    return { 'Content-Type': 'application/json' };
  };

  const fetchClaudeContent = async (brief: string): Promise<{ calendar_title: string; items: ContentItem[] }> => {
    const headers = await authHeaders();
    const res = await fetch(`${API_URL}/api/claude-content`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ content: brief }),
    });
    if (!res.ok) throw new Error('Failed to generate content');
    return res.json();
  };

  const pushToNotion = async (title: string, items: ContentItem[]): Promise<ExportResult> => {
    const headers = await authHeaders();
    try {
      const dbRes = await fetch(`${API_URL}/api/create-database`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          notionAuth,
          parentPageId: selectedPageId,
          databaseTitle: title,
          properties: {
            Name: { title: {} },
            Channel: {
              select: {
                options: [
                  { name: 'Instagram', color: 'pink' }, { name: 'LinkedIn', color: 'blue' },
                  { name: 'X', color: 'gray' }, { name: 'YouTube', color: 'red' },
                  { name: 'Newsletter', color: 'yellow' }, { name: 'Blog', color: 'green' },
                ],
              },
            },
            'Publish Date': { date: {} },
            Status: {
              select: {
                options: [
                  { name: 'Idea', color: 'gray' }, { name: 'Draft', color: 'yellow' },
                  { name: 'In Review', color: 'blue' }, { name: 'Scheduled', color: 'purple' },
                  { name: 'Published', color: 'green' },
                ],
              },
            },
            Format: {
              select: {
                options: [
                  { name: 'Carousel', color: 'orange' }, { name: 'Reel', color: 'pink' },
                  { name: 'Thread', color: 'blue' }, { name: 'Article', color: 'green' },
                  { name: 'Video', color: 'red' }, { name: 'Email', color: 'yellow' },
                ],
              },
            },
            Hook: { rich_text: {} },
          },
        }),
      });
      const { databaseResponse } = await dbRes.json();
      const dbId = databaseResponse.id;

      for (const item of items) {
        const props: any = {
          Name: { title: [{ type: 'text', text: { content: `${item.emoji} ${item.title}` } }] },
          Channel: { select: { name: item.channel } },
          Status: { select: { name: item.status } },
          Format: { select: { name: item.format } },
          Hook: { rich_text: [{ type: 'text', text: { content: item.hook } }] },
        };
        if (item.publish_date && item.publish_date !== 'NONE') {
          props['Publish Date'] = { date: { start: item.publish_date } };
        }
        await fetch(`${API_URL}/api/add-page`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            notionAuth, databaseId: dbId,
            icon: { type: 'emoji', emoji: item.emoji },
            pageProperties: props,
            children: [{ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: item.description } }] } }],
          }),
        });
      }

      return { destination: 'notion', success: true, link: 'https://notion.so' };
    } catch (err) {
      return { destination: 'notion', success: false, error: String(err) };
    }
  };

  const pushToAirtable = async (title: string, items: ContentItem[]): Promise<ExportResult> => {
    const headers = await authHeaders();
    try {
      const res = await fetch(`${API_URL}/api/push-airtable`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ airtableToken, title, items }),
      });
      if (!res.ok) throw new Error('Airtable push failed');
      const data = await res.json();
      return { destination: 'airtable', success: true, link: data.link };
    } catch (err) {
      return { destination: 'airtable', success: false, error: String(err) };
    }
  };

  const pushToGamma = async (title: string, items: ContentItem[]): Promise<ExportResult> => {
    const headers = await authHeaders();
    try {
      const res = await fetch(`${API_URL}/api/push-gamma`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ gammaKey, title, items }),
      });
      if (!res.ok) throw new Error('Gamma push failed');
      const data = await res.json();
      return { destination: 'gamma', success: true, link: data.link };
    } catch (err) {
      return { destination: 'gamma', success: false, error: String(err) };
    }
  };

  const incrementUsage = async () => {
    const headers = await authHeaders();
    await fetch(`${API_URL}/api/increment-usage`, {
      method: 'POST', headers, credentials: 'include',
      body: JSON.stringify({ editorContent }),
    });
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
    setExportResults([]);

    try {
      const { calendar_title, items } = await fetchClaudeContent(editorContent);
      const results: ExportResult[] = [];

      if (selectedDestinations.has('notion') && notionAuth && selectedPageId) results.push(await pushToNotion(calendar_title, items));
      if (selectedDestinations.has('airtable') && airtableToken) results.push(await pushToAirtable(calendar_title, items));
      if (selectedDestinations.has('gamma') && gammaKey) results.push(await pushToGamma(calendar_title, items));

      setExportResults(results);
      await incrementUsage();
      setGeneratingState('success');
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
          Generate &amp; Export
        </>
      )}
    </ShimmerButton>
  );
};

export default ContentGeneratorButton;
