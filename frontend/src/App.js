import React, { useState, useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, MessageSquare, Code2, Play, Sun, Moon } from 'lucide-react';

// Components
import CodeEditor from './components/CodeEditor';
import AIMentorPanel from './components/AIMentorPanel';
import TerminalPanel from './components/TerminalPanel';

import GuidedPopEditor from './components/GuidedPopEditor';

// Styles
import './index.css';


import { runCode } from './services/api';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  
  // Guided Pop Editor State
  const [isPopEditorOpen, setIsPopEditorOpen] = useState(false);
  const [popTemplate] = useState("for [i] in range([10]):\n    [print](i)");

  // Shared Code State
  const [code, setCode] = useState("# Start coding here...\nprint('Hello World')");
  const [language, setLanguage] = useState('python');

  // Code execution output state (passed to TerminalPanel)
  const [runOutput, setRunOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [inputRequest, setInputRequest] = useState(null);
  const [pendingRun, setPendingRun] = useState(null);
  
  // Memoized callback to prevent re-renders
  const handleRunResult = useCallback((result) => {
    setRunOutput({ ...result, _timestamp: Date.now() });
  }, []);

  // Theme State with Persistence
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('jarvis_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('jarvis_session_id', sessionId);
    }
    return sessionId;
  };

  const handleRunRequest = async (sourceCode, lang) => {
    if (isRunning) return;

    // Check for input() calls in Python
    if (lang === 'python') {
      const inputRegex = /input\s*\((.*?)\)/g;
      const matches = [...sourceCode.matchAll(inputRegex)];
      
      if (matches.length > 0) {
        // Found input() calls - ask Terminal to collect them
        const prompts = matches.map(m => {
          const raw = m[1];
          // Simple cleanup of quotes
          return raw.replace(/^["']|["']$/g, ''); 
        });

        setInputRequest({ prompts });
        setPendingRun({ code: sourceCode, language: lang }); // Store for after input
        
        // Switch to terminal view on mobile
        if (isMobile) {
          setActiveTab('terminal');
        }
        return;
      }
    }

    // No inputs needed, run immediately
    await executeCode(sourceCode, lang, '');
  };

  const handleInputComplete = async (stdin) => {
    if (!pendingRun) return;
    
    const { code, language } = pendingRun;
    setInputRequest(null); // Clear request
    setPendingRun(null);
    
    await executeCode(code, language, stdin);
  };

  const executeCode = async (sourceCode, lang, stdin) => {
    setIsRunning(true);
    const sessionId = getSessionId();

    try {
      const result = await runCode(sessionId, lang, sourceCode, stdin);
      handleRunResult(result);
    } catch (error) {
      console.error('Error running code:', error);
      handleRunResult({
        status: 'error',
        stdout: '',
        stderr: error.message || 'An unexpected error occurred',
      });
    } finally {
      setIsRunning(false);
    }
  };



  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {isMobile ? (
        /* Mobile Layout: Tabs */
        <div className="h-screen w-full bg-stone-50 dark:bg-slate-950 flex flex-col overflow-hidden transition-colors duration-300">
          {/* Mobile Header */}
          <header className="h-14 border-b border-stone-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900">
            <span className="font-semibold text-slate-800 dark:text-white">Jarvis AI</span>
            <div className="ml-auto flex items-center gap-3">
              <button 
                type="button"
                onClick={toggleTheme}
                className="p-2 text-stone-600 dark:text-slate-400"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20">
                <Play size={18} />
              </button>
            </div>
          </header>

          {/* Active View */}
          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === 'editor' && (
                <motion.div key="editor" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                  <CodeEditor 
                    themeMode={theme} 
                    code={code}
                    onCodeChange={setCode}
                    language={language}
                    onLanguageChange={setLanguage}
                    isProcessing={isRunning}
                    onRunRequest={handleRunRequest}
                  />
                </motion.div>
              )}
              {activeTab === 'terminal' && (
                <motion.div key="terminal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                  <TerminalPanel 
                    runOutput={runOutput} 
                    inputRequest={inputRequest}
                    onInputComplete={handleInputComplete}
                  />
                </motion.div>
              )}
              {activeTab === 'chat' && (
                <motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                  <AIMentorPanel code={code} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Bottom Navigation */}
          <nav className="h-16 bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 flex items-center justify-around pb-safe">
            <button 
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'editor' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-slate-500'}`}
            >
              <Code2 size={20} />
              <span className="text-[10px] font-medium">Editor</span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('terminal')}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'terminal' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-slate-500'}`}
            >
              <TerminalIcon size={20} />
              <span className="text-[10px] font-medium">Terminal</span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-slate-500'}`}
            >
              <MessageSquare size={20} />
              <span className="text-[10px] font-medium">Mentor</span>
            </button>
          </nav>
        </div>
      ) : (
        /* Desktop Layout: Split Screen */
        <div className="h-screen w-full bg-stone-50 dark:bg-slate-950 text-slate-800 dark:text-sand-100 flex flex-col overflow-hidden font-sans transition-colors duration-300">
          {/* Top Bar / Header */}
          <header className="h-14 border-b border-stone-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Code2 size={20} className="text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-800 dark:text-white">Jarvis AI</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Pop Editor Trigger */}
              <button 
                type="button"
                onClick={() => setIsPopEditorOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-stone-200 dark:border-slate-700 font-medium text-xs"
              >
                <span>Guided Code</span>
              </button>

              {/* Theme Toggle */}
              <button 
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full bg-stone-200 dark:bg-slate-800 text-stone-600 dark:text-slate-400 hover:bg-stone-300 dark:hover:bg-slate-700 transition-all active:scale-95"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* System Status */}
              <div className="flex items-center gap-2 px-3 py-1 bg-stone-100 dark:bg-slate-800/50 rounded-full border border-stone-200 dark:border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-stone-500 dark:text-slate-400 font-medium">System Online</span>
              </div>
            </div>
          </header>

          {/* Main Workspace */}
          <main className="flex-1 overflow-hidden relative">
            <PanelGroup direction="horizontal">
              
              {/* LEFT SIDE: Editor & Terminal */}
              <Panel defaultSize={60} minSize={30} className="flex flex-col h-full">
                <PanelGroup direction="vertical" className="h-full w-full">
                  {/* Top: Code Editor */}
                  <Panel defaultSize={70} minSize={20} className="bg-stone-100 dark:bg-slate-900/30 flex flex-col transition-colors">
                    <CodeEditor 
                      themeMode={theme} 
                      code={code}
                      onCodeChange={setCode}
                      language={language}
                      onLanguageChange={setLanguage}
                      isProcessing={isRunning}
                      onRunRequest={handleRunRequest}
                    />
                  </Panel>
                  
                  <PanelResizeHandle className="h-[2px] bg-stone-200 dark:bg-slate-800 hover:bg-indigo-500 transition-colors" />
                  
                  {/* Bottom: Terminal */}
                  <Panel defaultSize={30} minSize={10} className="bg-stone-900 dark:bg-black/40 border-t border-stone-200 dark:border-slate-800/50">
                    <TerminalPanel 
                      runOutput={runOutput} 
                      inputRequest={inputRequest}
                      onInputComplete={handleInputComplete}
                    />
                  </Panel>
                </PanelGroup>
              </Panel>

              <PanelResizeHandle className="w-[2px] bg-stone-200 dark:bg-slate-800 hover:bg-indigo-500 transition-colors" />

              {/* RIGHT SIDE: AI Mentor */}
              <Panel defaultSize={40} minSize={20} className="bg-white dark:bg-slate-900 border-l border-stone-200 dark:border-slate-800 transition-colors">
                <AIMentorPanel code={code} />
              </Panel>

            </PanelGroup>
          </main>
        </div>
      )}
      <GuidedPopEditor 
        isOpen={isPopEditorOpen} 
        onClose={() => setIsPopEditorOpen(false)}
        template={popTemplate}
        onComplete={(vals) => console.log('Completed:', vals)}
      />
    </>
  );
}

export default App;

