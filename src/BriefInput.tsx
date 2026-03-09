import React, { useEffect, useState } from 'react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { useUser } from '@clerk/react';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from './@/components/ui/select';
import LexicalEditor from './LexicalEditor';
import { editorContentAtom, generatingStateAtom, exportResultsAtom } from './atoms';
import { useAtomValue, useSetAtom } from 'jotai';
import ContentGeneratorButton from './ContentGeneratorButton';
import DestinationSelector from './DestinationSelector';
import PDFUploadButton from './PDFUploadButton';
import DocxUploadButton from './DocxUploadButton';
import { useUserIntegrations } from './hooks';
import { CheckCircle, XCircle, ExternalLink, AlertCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface NotionPage {
  id: string;
  parent: { type: string };
  properties: { title: { title: { text: { content: string } }[] } };
  title?: { text: { content: string } }[];
}

const BriefInput: React.FC = () => {
  const { user } = useUser();
  const [notionAuth, setNotionAuth] = useState('');
  const [userId, setUserId] = useState('');
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<NotionPage | null>(null);
  const [, setGetEditorText] = useState<() => string>(() => '');
  const editorContent = useAtomValue(editorContentAtom);
  const generatingState = useAtomValue(generatingStateAtom);
  const setGeneratingState = useSetAtom(generatingStateAtom);
  const exportResults = useAtomValue(exportResultsAtom);
  const integrations = useUserIntegrations(user);

  useEffect(() => {
    const fetchAuth = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_URL}/api/retrieve-user-notion-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        setNotionAuth(data?.notion_auth || '');
        setUserId(user.id);
      } catch { /* ignore */ }
    };
    fetchAuth();
  }, [user]);

  useEffect(() => {
    if (!notionAuth) return;
    const fetchPages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/list-pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notionToken: notionAuth }),
        });
        const data = await res.json();
        setPages(data.results || []);
      } catch { /* ignore */ }
    };
    fetchPages();
  }, [notionAuth]);

  const workspacePages = pages.filter((p) => p?.parent?.type === 'workspace');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />

      <main className="flex-grow container mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Generate content calendar</h1>
          <p className="text-white/40">Paste your brief, pick your destinations, and hit generate.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Brief input */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white/60">Your brief</p>
                <div className="flex gap-2">
                  <PDFUploadButton />
                  <DocxUploadButton />
                </div>
              </div>
              <LexicalEditor setGetEditorText={setGetEditorText} />
              {!editorContent.trim() && (
                <p className="text-xs text-white/25 italic">
                  Paste a marketing brief, campaign plan, keyword list, or strategy doc...
                </p>
              )}
            </div>

            {/* Notion page selector */}
            <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
              <p className="text-sm font-semibold text-white/60">Notion destination page</p>
              {workspacePages.length > 0 ? (
                <Select onValueChange={(id) => setSelectedPage(pages.find((p) => p.id === id) || null)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a workspace page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Workspace pages</SelectLabel>
                      {workspacePages.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page?.properties?.title?.title?.[0]?.text?.content ||
                            (page as any)?.title?.[0]?.text?.content ||
                            'Untitled'}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2.5 text-sm text-white/30">
                  <div className="w-4 h-4 border border-violet-500/30 border-t-violet-500 rounded-full animate-spin flex-shrink-0" />
                  Loading pages...
                </div>
              )}
            </div>
          </div>

          {/* Right: Destinations + Generate */}
          <div className="flex flex-col gap-4">
            <div className="glass-card rounded-xl p-5">
              <DestinationSelector
                airtableToken={integrations.airtable_token}
                gammaKey={integrations.gamma_api_key}
              />
            </div>

            <ContentGeneratorButton
              editorContent={editorContent}
              notionAuth={notionAuth}
              selectedPageId={selectedPage?.id || ''}
              userId={userId}
              airtableToken={integrations.airtable_token}
              gammaKey={integrations.gamma_api_key}
            />

            {/* Status */}
            {generatingState === 'limit_exceeded' && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-300">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                You've hit your monthly limit. Upgrade to Pro for unlimited exports.
              </div>
            )}
            {generatingState === 'error' && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Something went wrong. Check your connections and try again.
              </div>
            )}

            {/* Export results */}
            {exportResults.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Results</p>
                {exportResults.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                      r.success
                        ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                        : 'bg-red-500/10 border border-red-500/20 text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {r.success ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="capitalize font-medium">{r.destination}</span>
                    </div>
                    {r.success && r.link && (
                      <a href={r.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {generatingState === 'success' && exportResults.every(r => r.success) && (
              <button
                onClick={() => setGeneratingState('idle')}
                className="text-xs text-white/30 hover:text-white/50 transition-colors text-center"
              >
                Generate another →
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BriefInput;
