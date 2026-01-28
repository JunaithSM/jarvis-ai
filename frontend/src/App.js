import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Terminal as TerminalIcon, MessageSquare, Code2, Play, Sun, Moon } from 'lucide-react';

// Components
import CodeEditor from './components/CodeEditor';
import AIMentorPanel from './components/AIMentorPanel';
import TerminalPanel from './components/TerminalPanel';

// Styles
import './index.css';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // For mobile: 'editor', 'terminal', 'chat'
  
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

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop Layout: Split Screen
  const DesktopLayout = () => (
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
           {/* Theme Toggle */}
           <button 
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
                 <CodeEditor themeMode={theme} />
              </Panel>
              
              <PanelResizeHandle className="h-[2px] bg-stone-200 dark:bg-slate-800 hover:bg-indigo-500 transition-colors" />
              
              {/* Bottom: Terminal */}
              <Panel defaultSize={30} minSize={10} className="bg-stone-900 dark:bg-black/40 border-t border-stone-200 dark:border-slate-800/50">
                <TerminalPanel />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-[2px] bg-stone-200 dark:bg-slate-800 hover:bg-indigo-500 transition-colors" />

          {/* RIGHT SIDE: AI Mentor */}
          <Panel defaultSize={40} minSize={20} className="bg-white dark:bg-slate-900 border-l border-stone-200 dark:border-slate-800 transition-colors">
            <AIMentorPanel />
          </Panel>

        </PanelGroup>
      </main>
    </div>
  );

  // Mobile Layout: Tabs
  const MobileLayout = () => (
    <div className="h-screen w-full bg-stone-50 dark:bg-slate-950 flex flex-col overflow-hidden transition-colors duration-300">
       {/* Mobile Header */}
       <header className="h-14 border-b border-stone-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900">
         <span className="font-semibold text-slate-800 dark:text-white">Jarvis AI</span>
         <div className="ml-auto flex items-center gap-3">
            <button 
               onClick={toggleTheme}
               className="p-2 text-stone-600 dark:text-slate-400"
            >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20">
               <Play size={18} />
            </button>
         </div>
       </header>

       {/* Active View */}
       <main className="flex-1 overflow-hidden relative">
         <AnimatePresence mode="wait">
            {activeTab === 'editor' && (
              <motion.div key="editor" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                <CodeEditor themeMode={theme} />
              </motion.div>
            )}
            {activeTab === 'terminal' && (
              <motion.div key="terminal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                <TerminalPanel />
              </motion.div>
            )}
            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                <AIMentorPanel />
              </motion.div>
            )}
         </AnimatePresence>
       </main>

       {/* Bottom Navigation */}
       <nav className="h-16 bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 flex items-center justify-around pb-safe">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'editor' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-slate-500'}`}
          >
            <Code2 size={20} />
            <span className="text-[10px] font-medium">Editor</span>
          </button>
          <button 
            onClick={() => setActiveTab('terminal')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'terminal' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-slate-500'}`}
          >
            <TerminalIcon size={20} />
            <span className="text-[10px] font-medium">Terminal</span>
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-slate-500'}`}
          >
            <MessageSquare size={20} />
            <span className="text-[10px] font-medium">Mentor</span>
          </button>
       </nav>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}

export default App;
