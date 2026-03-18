import React, { useState } from 'react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { useUser } from '@clerk/react';
import LexicalEditor from './LexicalEditor';
import { editorContentAtom, generatingStateAtom, exportResultsAtom } from './atoms';
import { useAtomValue, useSetAtom } from 'jotai';
import ContentGeneratorButton from './ContentGeneratorButton';
import DestinationSelector from './DestinationSelector';
import PDFUploadButton from './PDFUploadButton';
import DocxUploadButton from './DocxUploadButton';
import { useUserIntegrations } from './hooks';
import { CheckCircle, XCircle, ExternalLink, AlertCircle } from 'lucide-react';

const BriefInput: React.FC = () => {
  const { user } = useUser();
  const [, setGetEditorText] = useState<() => string>(() => '');
  const editorContent = useAtomValue(editorContentAtom);
  const generatingState = useAtomValue(generatingStateAtom);
  const setGeneratingState = useSetAtom(generatingStateAtom);
  const exportResults = useAtomValue(exportResultsAtom);
  const integrations = useUserIntegrations(user);

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
          </div>

          {/* Right: Destinations + Generate */}
          <div className="flex flex-col gap-4">
            <div className="glass-card rounded-xl p-5">
              <DestinationSelector
                hubspotToken={integrations.hubspot_token}
                mondayToken={integrations.monday_token}
                mondayBoardId={integrations.monday_board_id}
                trelloApiKey={integrations.trello_api_key}
                trelloToken={integrations.trello_token}
              />
            </div>

            <ContentGeneratorButton
              editorContent={editorContent}
              hubspotToken={integrations.hubspot_token}
              mondayToken={integrations.monday_token}
              mondayBoardId={integrations.monday_board_id}
              trelloApiKey={integrations.trello_api_key}
              trelloToken={integrations.trello_token}
            />

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
