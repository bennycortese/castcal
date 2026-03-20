import React, { useState } from 'react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { useUser } from '@clerk/react';
import LexicalEditor from './LexicalEditor';
import { editorContentAtom, generatingStateAtom } from './atoms';
import { useAtomValue, useSetAtom } from 'jotai';
import ContentGeneratorButton from './ContentGeneratorButton';
import PDFUploadButton from './PDFUploadButton';
import DocxUploadButton from './DocxUploadButton';
import { XCircle, AlertCircle } from 'lucide-react';

const BriefInput: React.FC = () => {
  useUser();
  const [, setGetEditorText] = useState<() => string>(() => '');
  const editorContent = useAtomValue(editorContentAtom);
  const generatingState = useAtomValue(generatingStateAtom);
  const setGeneratingState = useSetAtom(generatingStateAtom);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />

      <main className="flex-grow container mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Generate content calendar</h1>
          <p className="text-white/40">Paste your brief, hit generate, then review and push to Buffer.</p>
        </div>

        <div className="flex flex-col gap-4">
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

          <ContentGeneratorButton editorContent={editorContent} />

          {generatingState === 'limit_exceeded' && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              You've hit your monthly limit. Upgrade to Pro for unlimited exports.
            </div>
          )}
          {generatingState === 'error' && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Something went wrong. Check your connection and try again.
              <button
                onClick={() => setGeneratingState('idle')}
                className="ml-auto text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BriefInput;
