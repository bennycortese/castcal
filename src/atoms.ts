import { atom } from 'jotai';

export const editorContentAtom = atom<string>('');
export const pdfChangeAtom = atom<boolean>(false);
export const generatingStateAtom = atom<'idle' | 'generating' | 'error' | 'limit_exceeded'>('idle');

export type ExportResult = {
  destination: string;
  success: boolean;
  link?: string;
  error?: string;
};

export const exportResultsAtom = atom<ExportResult[]>([]);

export type ContentItem = {
  title: string;
  channel: string;
  publish_date: string;
  status: string;
  format: string;
  hook: string;
  description: string;
  emoji: string;
};

export const generatedCalendarAtom = atom<{ calendar_title: string; items: ContentItem[] } | null>(null);
