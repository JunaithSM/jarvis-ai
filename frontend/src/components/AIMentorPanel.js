import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Lock, Unlock, Sparkles, AlertCircle, ArrowDown, Bot, User, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocraticHint } from '../services/api';

const AIMentorPanel = ({ code }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: "**Jarvis AI initialized.**\n\nI am ready to assist with your algorithm analysis.\n\nType of assistance available:\n- **Logic Hints**\n- **Syntax Help**\n- **Complexity Analysis**\n\nAwaiting input...",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const isAutoScrolling = useRef(false);

  // Progressive Hints State
  const [hints, setHints] = useState([
    { id: 1, title: 'Logic Hint', content: "Consider iterating through the array once. Keeping track of the current maximum value found so far is efficient.", locked: true },
    { id: 2, title: 'Code Structure', content: "Use a simple `for` loop starting from index 1 (since 0 is the initial max).", locked: true },
    { id: 3, title: 'Complexity Insight', content: "This approach results in **O(n)** time complexity because we visit every element exactly once.", locked: true }
  ]);

  // --- Smart Scrolling Logic ---

  const scrollToBottom = (smooth = true) => {
    if (scrollContainerRef.current) {
      isAutoScrolling.current = true;
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      setTimeout(() => { isAutoScrolling.current = false; }, 100);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || isAutoScrolling.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show button if we are more than 100px away from bottom
    setShowScrollButton(distanceFromBottom > 100);
  };

  // Scroll on new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    
    // Always scroll if user sent the message
    if (lastMessage.sender === 'user') {
      setTimeout(() => scrollToBottom(true), 50);
      return;
    }

    // For AI messages, only scroll if we were already near the bottom
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      if (distanceFromBottom < 150) {
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        setShowScrollButton(true); 
      }
    }
  }, [messages, isTyping]);


  // Input Auto-Resize
  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'; 
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }

    (async () => {
      try {
        const response = await getSocraticHint(userMsg.text, code);
        
        const aiMsg = { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: response.hint,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      } catch (error) {
        const errorMsg = { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: `**Error:** ${error.message}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
      }
    })();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unlockHint = (id) => {
    setHints(prev => prev.map(h => h.id === id ? { ...h, locked: false } : h));
  };

  return (
    <div className="h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] w-full flex relative flex-col bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 overflow-hidden">
      
      {/* Header - Fixed at top */}
      <header className="shrink-0 h-12 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl shadow-sm">
         <div className="flex items-center gap-2.5">
           <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
             <Bot size={18} strokeWidth={2} />
           </div>
           <div className="flex flex-col">
             <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">AI Mentor</span>
             <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Socratic Guide</span>
           </div>
         </div>
         <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Online</span>
         </div>
      </header>

      {/* Messages Area - Scrollable, takes remaining space */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
      >
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              key={msg.id} 
              className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg relative ${
                msg.sender === 'ai' 
                ? 'bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-600 dark:to-indigo-500 text-indigo-600 dark:text-white border border-indigo-200 dark:border-indigo-400/20' 
                : 'bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-500/30'
              }`}>
                {msg.sender === 'ai' ? <Bot size={18} /> : <User size={16} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] text-[13.5px] leading-relaxed p-4 shadow-sm ${
                msg.sender === 'ai' 
                  ? 'bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl rounded-tl-sm text-slate-700 dark:text-slate-200' 
                  : 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20 dark:shadow-indigo-500/10'
              }`}>
                {msg.sender === 'ai' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-code:bg-black prose-code:text-gray-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-black dark:prose-pre:bg-black prose-pre:border dark:prose-pre:border-slate-700 prose-pre:p-3 prose-pre:rounded-xl prose-pre:text-gray-300"
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                )}
              </div>
            </motion.div>
          ))}

         {isTyping && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
            >
               <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-600 dark:to-indigo-500 flex items-center justify-center border border-indigo-200 dark:border-indigo-400/20 shadow-lg">
                 <Bot size={18} className="text-indigo-600 dark:text-white" />
               </div>
               <div className="bg-white dark:bg-slate-800/60 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700/50 flex items-center gap-1.5 shadow-sm">
                 <span className="w-2 h-2 bg-indigo-400/60 dark:bg-indigo-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-indigo-400/60 dark:bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-indigo-400/60 dark:bg-indigo-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </motion.div>
          )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Floating Scroll Down Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-52 right-6 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all z-50 group"
          >
            <ArrowDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Strategic Hints - Fixed at bottom */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="p-3 space-y-2">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Strategic Hints</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-400 font-bold border border-slate-300 dark:border-slate-700">
                  {hints.filter(h => !h.locked).length} / {hints.length} UNLOCKED
              </span>
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar snap-x">
             {hints.map((hint) => (
               <div 
                 key={hint.id}
                 className={`shrink-0 w-56 text-xs p-3 rounded-xl border transition-all duration-300 snap-center flex flex-col gap-1.5 ${
                   hint.locked 
                     ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer group' 
                     : 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 shadow-sm'
                 }`}
                 onClick={() => hint.locked && unlockHint(hint.id)}
               >
                 <div className="flex items-center justify-between">
                    <span className={`font-bold tracking-tight ${hint.locked ? 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {hint.title}
                    </span>
                    {hint.locked 
                        ? <Lock size={12} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> 
                        : <Unlock size={12} className="text-emerald-500" />
                    }
                 </div>
                 
                 <div className="min-h-[32px] flex items-center">
                    {!hint.locked ? (
                       <ReactMarkdown className="prose prose-xs dark:prose-invert leading-relaxed text-slate-600 dark:text-slate-300 w-full">
                           {hint.content}
                       </ReactMarkdown>
                    ) : (
                       <p className="text-slate-400 dark:text-slate-600 italic flex items-center gap-1.5 w-full justify-center opacity-80 text-[11px]">
                           <Sparkles size={10} /> Tap to decrypt
                       </p>
                    )}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="shrink-0 w-[100%] p-4 pt-2 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <label className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 transition-all shadow-sm">
          <textarea 
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Jarvis AI..."
            className="flex-1 bg-transparent border-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 resize-none max-h-32 py-2.5 px-2 min-h-[24px]"
            rows={1}
            style={{ height: 'auto' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 mb-0.5 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-md shadow-indigo-500/20"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </label>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5 font-medium tracking-wide uppercase opacity-70">
            <AlertCircle size={10} strokeWidth={2.5} />
            Review all AI generated advice
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIMentorPanel;
