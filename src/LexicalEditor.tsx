import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useAtomValue, useSetAtom } from 'jotai';
import { editorContentAtom, pdfChangeAtom } from './atoms';
import './editor_styles.css';

function onChange(editorState: any, setEditorContent: (content: string) => void) {
  editorState.read(() => {
    const root = $getRoot();
    setEditorContent(root.getTextContent());
  });
}

function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => { editor.focus(); }, [editor]);
  return null;
}

function onError(error: any) { console.error(error); }

interface LexicalEditorProps {
  setGetEditorText: Dispatch<SetStateAction<() => string>>;
}

function SyncPlugin({ setGetEditorText }: LexicalEditorProps) {
  const [editor] = useLexicalComposerContext();
  const editorContent = useAtomValue(editorContentAtom);
  const pdfChange = useAtomValue(pdfChangeAtom);
  const setPdfChange = useSetAtom(pdfChangeAtom);

  useEffect(() => {
    if (editorContent && pdfChange) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode(editorContent));
        root.append(para);
        setPdfChange(false);
      });
    }
  }, [pdfChange, setPdfChange, editorContent, editor]);

  useEffect(() => {
    setGetEditorText(() => () => {
      let text = '';
      editor.getEditorState().read(() => { text = $getRoot().getTextContent(); });
      return text;
    });
  }, [editor, setGetEditorText]);

  return null;
}

function LexicalEditor({ setGetEditorText }: LexicalEditorProps) {
  const setEditorContent = useSetAtom(editorContentAtom);

  return (
    <LexicalComposer initialConfig={{ namespace: 'CastcalEditor', theme: {}, onError }}>
      <PlainTextPlugin
        contentEditable={<ContentEditable className="editor-container" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={(s) => onChange(s, setEditorContent)} />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <SyncPlugin setGetEditorText={setGetEditorText} />
    </LexicalComposer>
  );
}

export default LexicalEditor;
