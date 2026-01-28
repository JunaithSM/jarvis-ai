import React, { useState, useRef, useEffect } from 'react';
import { TerminalSquare, XCircle, RotateCcw } from 'lucide-react';

const TerminalPanel = () => {
  const [history, setHistory] = useState([
    { type: 'info', content: 'FocusFlow Terminal v1.0.0' },
    { type: 'success', content: 'Environment initialized successfully.' },
    { type: 'info', content: 'Type "help" for available commands.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (!cmd) return;

      setHistory(prev => [...prev, { type: 'command', content: `> ${cmd}` }]);
      setInput('');

      // Mock Command Processing
      setTimeout(() => {
        processCommand(cmd);
      }, 300);
    }
  };

  const processCommand = (cmd) => {
    let response = { type: 'output', content: '' };

    switch(cmd.toLowerCase()) {
      case 'help':
        response.content = 'Available commands: run, gcc, python, clear, date';
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'date':
        response.content = new Date().toString();
        break;
      case 'run': 
      case 'gcc':
      case 'python':
        response.type = 'info';
        response.content = 'Compiling and executing source... [Mock Output]';
        setTimeout(() => {
           setHistory(prev => [...prev, { type: 'success', content: 'Program executed successfully (Exit Code 0)' }]);
        }, 800);
        break;
      default:
        response.type = 'error';
        response.content = `Command not found: ${cmd}`;
    }

    setHistory(prev => [...prev, response]);
  };

  return (
    <div className="h-full w-full bg-black flex flex-col font-mono text-sm overflow-hidden">
      
      {/* Terminal Header */}
      <div className="h-9 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-slate-400">
           <TerminalSquare size={14} />
           <span className="text-xs font-semibold">TERMINAL</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={() => setHistory([])}
             className="text-slate-500 hover:text-sand-200 transition-colors" 
             title="Clear Console"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {history.map((entry, idx) => (
          <div key={idx} className={`${
            entry.type === 'command' ? 'text-slate-300 font-bold mt-2' : 
            entry.type === 'error' ? 'text-red-400' : 
            entry.type === 'success' ? 'text-emerald-400' : 
            entry.type === 'info' ? 'text-indigo-300' :
            'text-slate-400'
          }`}>
            {entry.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 pb-3 pt-1 bg-black">
        <div className="flex items-center gap-2">
           <span className="text-emerald-500 font-bold">➜</span>
           <span className="text-indigo-400 font-bold">~</span>
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={handleCommand}
             className="flex-1 bg-transparent border-none text-slate-200 focus:ring-0 placeholder-slate-700" 
             placeholder="Enter command..."
             autoComplete="off"
             spellCheck="false"
           />
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
