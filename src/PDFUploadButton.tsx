import React, { useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { useSetAtom } from 'jotai';
import { editorContentAtom, pdfChangeAtom } from './atoms';
import { Button } from './@/components/ui/button';
import { FileText } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

const PDFUploadButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setEditorContent = useSetAtom(editorContentAtom);
  const setPdfChange = useSetAtom(pdfChangeAtom);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) extractPdfText(e.target.files[0]);
  };

  const extractPdfText = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        for (const item of content.items) text += (item as any).str + ' ';
      }
      setEditorContent(text);
      setPdfChange(true);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
        <FileText className="w-3.5 h-3.5" />
        Upload PDF
      </Button>
      <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
    </>
  );
};

export default PDFUploadButton;
