import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TerminalSquare, RotateCcw, Square, Loader2 } from 'lucide-react';

const TerminalPanel = ({ wsUrl, isRunning, onRunFinished, onStop }) => {
  const [history, setHistory] = useState([
    { type: 'info', content: 'Jarvis Terminal v1.0.0' },
    { type: 'success', content: 'Environment initialized successfully.' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [connected, setConnected] = useState(false);
  // Text from stdout that arrived without a trailing newline (e.g. an input() prompt)
  const [pendingLine, setPendingLine] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const prevWsUrlRef = useRef(null);
  const exitHandledRef = useRef(false);
  // Use a ref to track pendingLine so we can read it synchronously in callbacks
  const pendingLineRef = useRef('');

  // Keep ref in sync
  useEffect(() => {
    pendingLineRef.current = pendingLine;
  }, [pendingLine]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, connected, pendingLine]);

  // Focus input when connected
  useEffect(() => {
    if (connected) {
      inputRef.current?.focus();
    }
  }, [connected]);

  // ── Process a raw chunk from the WebSocket ──
  const processChunk = useCallback((rawChunk) => {
    // Check for exit sentinel
    if (rawChunk.startsWith('__EXIT__:')) {
      const code = parseInt(rawChunk.split(':')[1], 10);
      const exitEntry =
        code === 0
          ? { type: 'success', content: '✓ Program exited successfully (code 0)' }
          : { type: 'error', content: `✗ Program exited with code ${code}` };

      setPendingLine('');
      pendingLineRef.current = '';
      setHistory(prev => [...prev, exitEntry]);
      setConnected(false);
      wsRef.current = null;
      exitHandledRef.current = true;
      if (onRunFinished) onRunFinished();
      return;
    }

    // Prepend any leftover pending text to the incoming chunk
    const currentPending = pendingLineRef.current;
    const combined = currentPending + rawChunk;

    // Split into lines
    const parts = combined.split('\n');

    // Everything except the last segment are complete lines
    const completeLines = parts.slice(0, -1);
    const leftover = parts[parts.length - 1]; // '' if chunk ended with \n

    if (completeLines.length > 0) {
      setHistory(h => [
        ...h,
        ...completeLines.map(line => ({ type: 'output', content: line })),
      ]);
    }

    setPendingLine(leftover);
    pendingLineRef.current = leftover;
  }, [onRunFinished]);

  // ── WebSocket lifecycle ──
  useEffect(() => {
    if (!wsUrl || wsUrl === prevWsUrlRef.current) return;
    prevWsUrlRef.current = wsUrl;
    exitHandledRef.current = false;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setPendingLine('');
    pendingLineRef.current = '';
    setHistory(prev => [
      ...prev,
      { type: 'command', content: '▶ Running code...' },
    ]);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      processChunk(event.data);
    };

    ws.onerror = () => {
      setHistory(prev => [
        ...prev,
        { type: 'error', content: '✗ WebSocket connection error' },
      ]);
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        setConnected(false);
        wsRef.current = null;
      }
      if (!exitHandledRef.current) {
        if (onRunFinished) onRunFinished();
      }
    };

    return () => {
      if (wsRef.current === ws) {
        ws.close();
        wsRef.current = null;
      }
    };
  }, [wsUrl, onRunFinished, processChunk]);

  // ── Send stdin ──
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && connected && wsRef.current) {
        const val = inputValue;
        setInputValue('');

        // Merge the pending prompt text + user input into one completed history line
        const currentPending = pendingLineRef.current;
        if (currentPending) {
          setHistory(h => [...h, { type: 'output', content: currentPending + ' ' + val }]);
        } else {
          setHistory(h => [...h, { type: 'stdin', content: val }]);
        }
        setPendingLine('');
        pendingLineRef.current = '';

        try {
          wsRef.current.send(val);
        } catch (err) {
          setHistory(prev => [
            ...prev,
            { type: 'error', content: '✗ Failed to send input' },
          ]);
        }
      }
    },
    [connected, inputValue]
  );

  // ── Clear terminal ──
  const clearTerminal = () => {
    setHistory([
      { type: 'info', content: 'Jarvis Terminal v1.0.0' },
      { type: 'info', content: 'Terminal cleared.' },
    ]);
    setPendingLine('');
    pendingLineRef.current = '';
  };

  // ── Stop ──
  const handleStop = () => {
    if (onStop) onStop();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setPendingLine('');
    pendingLineRef.current = '';
    setHistory(prev => [
      ...prev,
      { type: 'error', content: '⏹ Process terminated by user' },
    ]);
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
          {connected && (
            <span className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
            </span>
          )}
          {isRunning && !connected && (
            <span className="flex items-center gap-1.5 ml-2 text-amber-400">
              <Loader2 size={11} className="animate-spin" />
              <span className="text-[10px] font-medium">CONNECTING</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isRunning && (
            <button
              onClick={(e) => { e.stopPropagation(); handleStop(); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-[10px] font-medium"
              title="Stop Process"
            >
              <Square size={10} fill="currentColor" />
              <span>STOP</span>
            </button>
          )}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 custom-scrollbar">
        {history.map((entry, idx) => {
          if (entry.type === 'stdin') {
            return (
              <div key={idx} className="flex items-center">
                <span className="text-indigo-400 mr-2 select-none">›</span>
                <span className="text-slate-100">{entry.content}</span>
              </div>
            );
          }
          return (
            <div
              key={idx}
              className={`${
                entry.type === 'command'
                  ? 'text-slate-500 font-bold mt-3 mb-1'
                  : entry.type === 'error'
                  ? 'text-red-400'
                  : entry.type === 'success'
                  ? 'text-emerald-400'
                  : entry.type === 'info'
                  ? 'text-indigo-300'
                  : 'text-slate-300'
              } whitespace-pre-wrap break-all`}
            >
              {entry.content}
            </div>
          );
        })}

        {/* Active Input Line */}
        {connected && (
          <div className="flex items-center mt-1 group">
            {pendingLine && (
              <span className="text-slate-300 whitespace-pre">{pendingLine}</span>
            )}
            {!pendingLine && (
              <span className="text-emerald-400 font-bold mr-2 select-none animate-pulse">›</span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600 p-0 focus:ring-0 caret-emerald-400"
              placeholder={pendingLine ? '' : 'Type input and press Enter...'}
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
