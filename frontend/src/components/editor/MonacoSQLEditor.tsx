'use client';

import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface MonacoSQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  disabled?: boolean;
}

export default function MonacoSQLEditor({
  value,
  onChange,
  onExecute,
  disabled = false,
}: MonacoSQLEditorProps) {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Register Ctrl+Enter or Cmd+Enter to execute SQL
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecute();
    });

    // Configure SQL formatting and autocomplete
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: () => {
        const keywords = [
          'SELECT',
          'FROM',
          'WHERE',
          'JOIN',
          'INNER JOIN',
          'LEFT JOIN',
          'GROUP BY',
          'ORDER BY',
          'HAVING',
          'LIMIT',
          'INSERT INTO',
          'UPDATE',
          'DELETE',
          'CREATE TABLE',
          'EXPLAIN QUERY PLAN',
          'COUNT',
          'AVG',
          'SUM',
          'MIN',
          'MAX',
        ];
        const suggestions = keywords.map((k) => ({
          label: k,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: k,
        }));
        return { suggestions };
      },
    });
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-slate-800 shadow-inner">
      <Editor
        height="100%"
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: disabled,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
