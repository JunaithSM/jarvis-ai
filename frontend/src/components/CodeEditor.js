import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github'; // We'll try to use a light theme if installed, or default
import { ChevronDown, Play, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CodeEditor = ({ themeMode }) => {
  const [code, setCode] = useState("// Start coding here...\nconsole.log('Hello World');");
  const [language, setLanguage] = useState('javascript');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Language Extensions Map
  const getLanguageExtension = (lang) => {
    switch(lang) {
      case 'python': return python();
      case 'c': 
      case 'cpp': return cpp();
      default: return javascript({ jsx: true });
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
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
          
          {/* Language Selector */}
          <div className="relative z-20">
            <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-stone-200 dark:bg-slate-800 hover:bg-stone-300 dark:hover:bg-slate-700 text-xs font-medium text-stone-600 dark:text-slate-300 transition-colors border border-stone-300/50 dark:border-slate-700/50"
            >
              <span className="capitalize">{language === 'cpp' ? 'C++' : language}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden py-1"
                >
                  {['javascript', 'python', 'cpp', 'c'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className="w-full text-left px-3 py-2 text-xs text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-white transition-colors capitalize"
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Run Button (Desktop) */}
          <button className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
             <Play size={12} fill="currentColor" />
             <span>RUN</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative group">
        <CodeMirror
          value={code}
          height="100%"
          theme={themeMode === 'dark' ? oneDark : 'light'}
          extensions={[getLanguageExtension(language)]}
          onChange={(val) => setCode(val)}
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
            autocompletion: true,
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

export default CodeEditor;
