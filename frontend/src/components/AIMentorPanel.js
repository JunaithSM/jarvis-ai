import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Lock, Unlock, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AIMentorPanel = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: "**Jarvis AI initialized.**\n\nI am ready to assist with your algorithm analysis.\n\nType of assistance available:\n- `Logic Hints`\n- `Syntax Help`\n- `Complexity Analysis`\n\nAwaiting input...",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Progressive Hints State
  const [hints, setHints] = useState([
    { id: 1, title: 'Logic Hint', content: "Consider iterating through the array once. Keeping track of the current maximum value found so far is efficient.", locked: true },
    { id: 2, title: 'Code Structure', content: "Use a simple `for` loop starting from index 1 (since 0 is the initial max).", locked: true },
    { id: 3, title: 'Complexity Insight', content: "This approach results in **O(n)** time complexity because we visit every element exactly once.", locked: true }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Input Auto-Resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: "I see you're working on finding the maximum value. Remember to check if the array is **empty** first to avoid errors.\n\nWould you like a *hint* on the loop structure or a `pseudocode` example?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
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
    <div className="h-full w-full flex flex-col bg-stone-50/30 dark:bg-slate-900 border-l border-stone-200 dark:border-slate-800 transition-colors">
      
      {/* Header */}
      <div className="h-10 px-4 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
         <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
           <Sparkles size={16} />
           <span className="text-xs font-bold tracking-wider">AI_MENTOR</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-stone-500 dark:text-slate-500 uppercase">Online</span>
         </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar bg-stone-100 dark:bg-slate-900"
      >
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === 'ai' 
              ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20' 
              : 'bg-stone-300 dark:bg-slate-700 text-stone-600 dark:text-slate-300'
            }`}>
              {msg.sender === 'ai' ? <Sparkles size={14} /> : <span className="text-xs font-bold">You</span>}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] text-sm leading-relaxed p-3 px-4 shadow-sm ${
              msg.sender === 'ai' 
                ? 'bg-white dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/50 rounded-2xl rounded-tl-none text-slate-800 dark:text-slate-200 select-none' // Anti-cheat: select-none
                : 'bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-indigo-500/10'
            }`}>
              {msg.sender === 'ai' ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:bg-slate-950 prose-pre:p-2 prose-pre:rounded-lg"
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                 <div className="whitespace-pre-wrap">{msg.text}</div>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
               <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
             </div>
             <div className="bg-white dark:bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-stone-200 dark:border-slate-700/30 flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-slate-500 rounded-full animate-bounce delay-100"></span>
               <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-slate-500 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
      </div>

      {/* Hints Section (Collapsible) */}
      <div className="border-t border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/50">
        <div className="p-3 space-y-2">
           <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-stone-500 dark:text-slate-500 uppercase">Decryption Keys</span>
              <span className="text-[10px] bg-stone-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-stone-500 dark:text-slate-400">{hints.filter(h => !h.locked).length}/{hints.length}</span>
           </div>
           
           <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
             {hints.map((hint) => (
               <div 
                 key={hint.id}
                 className={`text-xs p-2 rounded-lg border transition-all duration-300 ${
                   hint.locked 
                     ? 'bg-stone-100 dark:bg-slate-800 border-stone-200 dark:border-slate-700 opacity-60 hover:opacity-100 cursor-pointer' 
                     : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                 }`}
                 onClick={() => hint.locked && unlockHint(hint.id)}
               >
                 <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${hint.locked ? 'text-stone-500 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {hint.title}
                    </span>
                    {hint.locked ? <Lock size={10} className="text-stone-400" /> : <Unlock size={10} className="text-emerald-500" />}
                 </div>
                 {!hint.locked && (
                   <div className="text-stone-600 dark:text-slate-300 leading-relaxed">
                      <ReactMarkdown className="prose prose-xs dark:prose-invert">{hint.content}</ReactMarkdown>
                   </div>
                 )}
                 {hint.locked && <p className="text-stone-400 dark:text-slate-500 italic">Click to decrypt hint sequence...</p>}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-stone-200 dark:border-slate-800 transition-colors">
        <div className="relative flex items-end gap-2 bg-stone-100 dark:bg-slate-900 rounded-xl p-2 border border-stone-200 dark:border-slate-800 focus-within:border-indigo-500/50 transition-colors">
          <textarea 
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Jarvis AI... (Shift+Enter for newline)"
            className="flex-1 bg-transparent border-none text-sm text-slate-800 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 focus:ring-0 resize-none max-h-32 py-2"
            rows={1}
          />
          <button 
             onClick={handleSend}
             disabled={!input.trim()}
             className="p-2 mb-0.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 text-center">
           <span className="text-[10px] text-stone-400 dark:text-slate-600 flex items-center justify-center gap-1">
             <AlertCircle size={10} />
             AI cannot protect you from logic errors.
           </span>
        </div>
      </div>

    </div>
  );
};

export default AIMentorPanel;
