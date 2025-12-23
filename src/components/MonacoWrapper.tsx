"use client";

import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface MonacoWrapperProps {
  query: string;
  onChange: (value: string) => void;
}

export default function MonacoWrapper({ query, onChange }: MonacoWrapperProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeRef = useRef(onChange);
  const isSettingValue = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = monaco.editor.create(editorRef.current, {
      value: query,
      language: "sql",
      theme: "vs-dark",
      automaticLayout: true,
    });
    
    monacoEditorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      if (!isSettingValue.current) {
        onChangeRef.current(editor.getValue());
      }
    });

    return () => editor.dispose();
  }, []);

  useEffect(() => {
    if (monacoEditorRef.current) {
      const currentValue = monacoEditorRef.current.getValue();
      if (currentValue !== query) {
        isSettingValue.current = true;
        monacoEditorRef.current.setValue(query);
        isSettingValue.current = false;
      }
    }
  }, [query]);
  //100% for container 100vh height and 100vw width for viewport
  return <div ref={editorRef} style={{ height: "100%", width: "100%" }} />;
}
