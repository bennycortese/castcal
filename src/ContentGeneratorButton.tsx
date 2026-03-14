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
  slackWebhookUrl: string | null;
  hubspotToken: string | null;
  mondayToken: string | null;
  mondayBoardId: string | null;
  trelloApiKey: string | null;
  trelloToken: string | null;
}

const ContentGeneratorButton: React.FC<ContentGeneratorButtonProps> = ({
  editorContent,
  notionAuth,
  selectedPageId,
  userId,
  airtableToken,
  slackWebhookUrl,
  hubspotToken,
  mondayToken,
  mondayBoardId,
  trelloApiKey,
  trelloToken,
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

  const pushToCSV = (title: string, items: ContentItem[]): ExportResult => {
    try {
      const header = ['Title', 'Channel', 'Publish Date', 'Status', 'Format', 'Hook', 'Description'];
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const rows = items.map((item) => [
        escape(`${item.emoji} ${item.title}`),
        escape(item.channel),
        escape(item.publish_date),
        escape(item.status),
        escape(item.format),
        escape(item.hook),
        escape(item.description),
      ].join(','));
      const csv = [header.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return { destination: 'csv', success: true };
    } catch (err) {
      return { destination: 'csv', success: false, error: String(err) };
    }
  };

  const pushToSlack = async (title: string, items: ContentItem[]): Promise<ExportResult> => {
    const headers = await authHeaders();
    try {
      const res = await fetch(`${API_URL}/api/push-slack`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ slackWebhookUrl, title, items }),
      });
      if (!res.ok) throw new Error('Slack push failed');
      return { destination: 'slack', success: true };
    } catch (err) {
      return { destination: 'slack', success: false, error: String(err) };
    }
  };

  const pushToHubSpot = async (title: string, items: ContentItem[]): Promise<ExportResult> => {
    const headers = await authHeaders();
    try {
      const res = await fetch(`${API_URL}/api/push-hubspot`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ hubspotToken, title, items }),
      });
      if (!res.ok) throw new Error('HubSpot push failed');
      const data = await res.json();
      return { destination: 'hubspot', success: true, link: data.link };
    } catch (err) {
      return { destination: 'hubspot', success: false, error: String(err) };
    }
  };

  const pushToMonday = async (title: string, items: ContentItem[]): Promise<ExportResult> => {
    const headers = await authHeaders();
    try {
      const res = await fetch(`${API_URL}/api/push-monday`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ mondayToken, mondayBoardId, title, items }),
      });
      if (!res.ok) throw new Error('Monday.com push failed');
      const data = await res.json();
      return { destination: 'monday', success: true, link: data.link };
    } catch (err) {
      return { destination: 'monday', success: false, error: String(err) };
    }
  };

  const pushToTrello = async (title: string, items: ContentItem[]): Promise<ExportResult> => {
    const headers = await authHeaders();
    try {
      const res = await fetch(`${API_URL}/api/push-trello`, {
        method: 'POST', headers, credentials: 'include',
        body: JSON.stringify({ trelloApiKey, trelloToken, title, items }),
      });
      if (!res.ok) throw new Error('Trello push failed');
      const data = await res.json();
      return { destination: 'trello', success: true, link: data.link };
    } catch (err) {
      return { destination: 'trello', success: false, error: String(err) };
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
      if (selectedDestinations.has('csv')) results.push(pushToCSV(calendar_title, items));
      if (selectedDestinations.has('slack') && slackWebhookUrl) results.push(await pushToSlack(calendar_title, items));
      if (selectedDestinations.has('hubspot') && hubspotToken) results.push(await pushToHubSpot(calendar_title, items));
      if (selectedDestinations.has('monday') && mondayToken && mondayBoardId) results.push(await pushToMonday(calendar_title, items));
      if (selectedDestinations.has('trello') && trelloApiKey && trelloToken) results.push(await pushToTrello(calendar_title, items));

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
