import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Play } from 'lucide-react';

const GuidedPopEditor = ({ isOpen, onClose, template, onComplete }) => {
  const [segments, setSegments] = useState([]);
  const [inputs, setInputs] = useState({});
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Parse template on load
  // Template format: "for [i] in range([10]):"
  useEffect(() => {
    if (!template) return;
    
    // Regex to find [content] placeholders
    const parts = template.split(/(\[.*?\])/g);
    const newSegments = parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const key = `input_${index}`;
        return { type: 'input', value: part.slice(1, -1), key };
      }
      return { type: 'text', value: part };
    });
    
    setSegments(newSegments);
    
    // Initialize inputs with empty strings
    const initialInputs = {};
    newSegments.forEach(seg => {
      if (seg.type === 'input') initialInputs[seg.key] = '';
    });
    setInputs(initialInputs);
    setIsCorrect(false);
  }, [template]);

  const handleInputChange = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = () => {
    // Simple validation: Check if inputs match the placeholder values (mock logic)
    // In a real app, we might check against a specific expected answer prop.
    // For now, let's just check if they are not empty.
    const allFilled = Object.values(inputs).every(val => val.trim().length > 0);
    if (allFilled) {
      setIsCorrect(true);
      if (onComplete) onComplete(Object.values(inputs));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center md:justify-end"
          >
            {/* Modal / Slide-over Panel */}
            <motion.div 
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="w-full md:w-[450px] h-[80vh] md:h-screen bg-stone-50 dark:bg-slate-900 border-l border-stone-200 dark:border-slate-800 shadow-2xl flex flex-col mt-[20vh] md:mt-0 rounded-t-2xl md:rounded-none overflow-hidden"
            >
              
              {/* Header */}
              <div className="h-14 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 relative">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-8 bg-indigo-500 rounded-full mr-1"></div>
                   <div>
                     <h2 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">GUIDED EDITOR</h2>
                     <p className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">Fill in the missing logic</p>
                   </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Editor Content */}
              <div className="flex-1 p-8 overflow-y-auto bg-stone-100 dark:bg-black/20 flex flex-col items-center justify-center">
                 
                 <div className="w-full max-w-md space-y-8">
                   
                   {/* Instruction */}
                   <div className="text-center space-y-2">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wider mb-2">
                       <AlertCircle size={12} />
                       CHALLENGE
                     </span>
                     <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                       Complete the code snippet below to iterate through the range.
                     </p>
                   </div>

                   {/* Code Block */}
                   <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-stone-200 dark:border-slate-800 p-6 md:p-8 font-mono text-sm md:text-base relative overflow-hidden group">
                      {/* Line Numbers Decoration */}
                      <div className="absolute left-4 top-8 bottom-8 w-px bg-stone-100 dark:bg-slate-800/50"></div>
                      
                      <div className="relative pl-6 space-y-2 leading-loose">
                        {segments.map((seg, idx) => (
                           seg.type === 'text' ? (
                             <span key={idx} className="text-stone-400 dark:text-slate-600 select-none">
                               {seg.value}
                             </span>
                           ) : (
                             <input 
                               key={seg.key}
                               value={inputs[seg.key]}
                               onChange={(e) => handleInputChange(seg.key, e.target.value)}
                               className={`
                                 mx-1 px-2 py-0.5 rounded min-w-[3rem] w-auto max-w-[8rem] text-center
                                 bg-indigo-50 dark:bg-indigo-500/10 border-b-2 outline-none transition-all
                                 ${isCorrect 
                                   ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50' 
                                   : 'border-indigo-400 focus:border-indigo-600 text-slate-800 dark:text-white font-semibold'
                                 }
                               `}
                               placeholder="???"
                             />
                           )
                        ))}
                      </div>
                   </div>

                   {/* Run / Verify Action */}
                   <div className="flex justify-center">
                     <button
                       onClick={handleRun}
                       disabled={isCorrect}
                       className={`
                         flex items-center gap-2 px-8 py-3 rounded-xl font-bold tracking-wide shadow-lg transition-all active:scale-95
                         ${isCorrect 
                           ? 'bg-emerald-500 text-white cursor-default' 
                           : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                         }
                       `}
                     >
                       {isCorrect ? (
                         <>
                           <Check size={18} />
                           <span>CORRECT</span>
                         </>
                       ) : (
                         <>
                           <Play size={18} fill="currentColor" />
                           <span>VERIFY CODE</span>
                         </>
                       )}
                     </button>
                   </div>

                 </div>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GuidedPopEditor;
