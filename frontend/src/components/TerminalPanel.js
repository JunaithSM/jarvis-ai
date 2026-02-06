import React, { useRef, useEffect, useState } from 'react';
import { TerminalSquare, RotateCcw } from 'lucide-react';

const TerminalPanel = ({ runOutput, inputRequest, onInputComplete }) => {
  const [history, setHistory] = useState([
    { type: 'info', content: 'Jarvis Terminal v1.0.0' },
    { type: 'success', content: 'Environment initialized successfully.' },
  ]);
  const [inputInput, setInputInput] = useState('');
  const [inputMode, setInputMode] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [collectedInputs, setCollectedInputs] = useState([]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  // Store refs to prevent infinite loop or double execution
  const lastProcessedRef = useRef(null);
  const lastRequestRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, inputMode]);

  // Focus input on mount and clicks
  useEffect(() => {
    if (inputMode) {
      inputRef.current?.focus();
    }
  }, [inputMode]);

  // Handle Input Requests from CodeEditor
  useEffect(() => {
    // Only process if it's a new request object
    if (inputRequest && inputRequest !== lastRequestRef.current) {
      lastRequestRef.current = inputRequest;
      setInputMode(true);
      setCurrentPromptIndex(0);
      setCollectedInputs([]);
      // We don't add "Program running" because Editor likely just triggered.
      // But we can add a separator if we want.
    }
  }, [inputRequest]);

  // Handle incoming run output from CodeEditor
  useEffect(() => {
    if (runOutput && runOutput !== lastProcessedRef.current) {
      lastProcessedRef.current = runOutput;
      
      const entries = [];
      
      // Add execution header
      entries.push({ type: 'command', content: '> Running code...' });
      
      // Add stdout
      if (runOutput.stdout) {
        entries.push({ type: 'output', content: runOutput.stdout });
      }
      
      // Add stderr
      if (runOutput.stderr) {
        entries.push({ type: 'error', content: runOutput.stderr });
      }
      
      // Add status message
      if (runOutput.status === 'success') {
        entries.push({ 
          type: 'success', 
          content: `✓ Program executed successfully${runOutput.time_ms ? ` (${runOutput.time_ms}ms)` : ''}` 
        });
      } else if (runOutput.status === 'compile_error') {
         entries.push({ type: 'error', content: '✗ Compilation failed' });
      } else if (runOutput.status === 'runtime_error') {
        entries.push({ 
          type: 'error', 
          content: `✗ Runtime error (exit code: ${runOutput.exit_code})` 
        });
      } else if (runOutput.status === 'error') {
        entries.push({ type: 'error', content: '✗ Execution failed' });
      } else if (runOutput.status?.includes('timeout')) {
        entries.push({ type: 'error', content: '✗ Execution timed out' });
      }
      
      setHistory(prev => [...prev, ...entries]);
    }
  }, [runOutput]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!inputMode || !inputRequest) return;

      const val = inputInput;
      setInputInput('');

      // We are answering a Python input() prompt
      const currentPrompt = inputRequest.prompts[currentPromptIndex] || '';
      
      // Show the prompt and the answer in history so it looks like a real session
      setHistory(prev => [
        ...prev, 
        { type: 'input-interaction', prompt: currentPrompt, response: val }
      ]);
      
      const newCollected = [...collectedInputs, val];
      setCollectedInputs(newCollected);

      // Check if we have more prompts
      if (currentPromptIndex + 1 < inputRequest.prompts.length) {
        setCurrentPromptIndex(prev => prev + 1);
      } else {
        // All done!
        setInputMode(false);
        setCollectedInputs([]);
        onInputComplete(newCollected.join('\n'));
      }
    }
  };

  const clearTerminal = () => {
    setHistory([
      { type: 'info', content: 'Jarvis Terminal v1.0.0' },
      { type: 'info', content: 'Terminal cleared.' }
    ]);
  };

  const getPromptLabel = () => {
    if (inputMode && inputRequest) {
       // Just the prompt text from Python's input("THIS TEXT")
       return inputRequest.prompts[currentPromptIndex] || '';
    }
    return '';
  };

  return (
    <div 
      className="h-full w-full bg-black flex flex-col font-mono text-sm overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      
      {/* Terminal Header */}
      <div className="h-9 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
           <TerminalSquare size={14} />
           <span className="text-xs font-semibold">OUTPUT</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={(e) => { e.stopPropagation(); clearTerminal(); }}
             className="text-slate-500 hover:text-slate-200 transition-colors" 
             title="Clear Console"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {history.map((entry, idx) => {
           if (entry.type === 'input-interaction') {
              return (
                 <div key={idx} className="flex flex-wrap">
                    <span className="text-slate-300 font-bold whitespace-pre mr-2">{entry.prompt}</span>
                    <span className="text-slate-100 whitespace-pre">{entry.response}</span>
                 </div>
              );
           }
           return (
            <div key={idx} className={`${
              entry.type === 'command' ? 'text-slate-500 font-bold mt-2' : // Dimmed command line
              entry.type === 'error' ? 'text-red-400' : 
              entry.type === 'success' ? 'text-emerald-400' : 
              entry.type === 'info' ? 'text-indigo-300' :
              'text-slate-300'
            } whitespace-pre-wrap`}>
              {entry.content}
            </div>
           );
        })}
        
        {/* Active Input Line - ONLY shown when inputMode is true */}
        {inputMode && (
          <div className="flex items-center mt-1 group">
             {/* Show the Python input prompt text */}
             <span className="text-yellow-400 font-bold mr-2 whitespace-pre">
               ? {getPromptLabel()}
             </span>
             {/* The Input Field */}
             <input
               ref={inputRef}
               type="text"
               value={inputInput}
               onChange={(e) => setInputInput(e.target.value)}
               onKeyDown={handleKeyDown}
               className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600 p-0 focus:ring-0 caret-slate-100"
               autoComplete="off"
               spellCheck="false"
             />
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalPanel;
