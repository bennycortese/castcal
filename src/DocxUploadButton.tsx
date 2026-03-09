import React, { useRef } from 'react';
import * as mammoth from 'mammoth';
import { useSetAtom } from 'jotai';
import { editorContentAtom, pdfChangeAtom } from './atoms';
import { Button } from './@/components/ui/button';
import { FileText } from 'lucide-react';

const DocxUploadButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setEditorContent = useSetAtom(editorContentAtom);
  const setPdfChange = useSetAtom(pdfChangeAtom);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result;
      if (result instanceof ArrayBuffer) {
        const { value } = await mammoth.extractRawText({ arrayBuffer: result });
        setEditorContent(value);
        setPdfChange(true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
        <FileText className="w-3.5 h-3.5" />
        Upload DOCX
      </Button>
      <input type="file" accept=".docx" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
    </>
  );
};

export default DocxUploadButton;
