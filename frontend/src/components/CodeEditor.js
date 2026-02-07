import React, { memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

import { Play, Code2, Loader2 } from 'lucide-react';


const CodeEditor = ({ themeMode, code, onCodeChange, language, isProcessing, onRunRequest }) => {

  // Handle code execution
  const handleRunCode = () => {
    if (onRunRequest) {
      onRunRequest(code, language);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-stone-50/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors">
      
      {/* Editor Header / Toolbar */}
      <div className="h-10 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between px-3 bg-white/50 dark:bg-slate-950/30">
        
        {/* Left: Title */}
        <div className="flex items-center gap-2 text-stone-500 dark:text-slate-400">
           <Code2 size={14} />
           <span className="text-xs font-medium tracking-wide">MAIN_EDITOR</span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          
          {/* Python Language Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-stone-200 dark:bg-slate-800 text-xs font-medium text-stone-600 dark:text-slate-300 border border-stone-300/50 dark:border-slate-700/50">
            <span>Python</span>
          </div>

          {/* Run Button (Desktop) */}
          <button 
            type="button"
            onClick={handleRunCode}
            disabled={isProcessing}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={12} fill="currentColor" />
                <span>RUN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative group">
        <CodeMirror
          value={code}
          height="100%"
          theme={themeMode === 'dark' ? oneDark : 'light'}
          extensions={[python()]}
          onChange={(val) => onCodeChange(val)}
          className="h-full text-sm font-mono focus:outline-none"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
        {/* Soft active glow */}
        <div className="absolute inset-0 border-2 border-transparent group-focus-within:border-indigo-500/10 pointer-events-none transition-colors duration-500"></div>
      </div>

    </div>
  );
};

export default memo(CodeEditor);

