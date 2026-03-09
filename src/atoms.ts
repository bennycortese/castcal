import { atom } from 'jotai';

export const editorContentAtom = atom<string>('');
export const pdfChangeAtom = atom<boolean>(false);
export const generatingStateAtom = atom<'idle' | 'generating' | 'success' | 'error' | 'limit_exceeded'>('idle');
export const selectedDestinationsAtom = atom<Set<string>>(new Set(['notion']));

export type ExportResult = {
  destination: string;
  success: boolean;
  link?: string;
  error?: string;
};

export const exportResultsAtom = atom<ExportResult[]>([]);
