import React from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import './FloatingRunButton.css';

const FloatingRunButton = ({ onClick, isRunning = false }) => {
  return (
    <motion.button 
      className={`floating-run-btn ${isRunning ? 'floating-run-btn--running' : ''}`}
      onClick={onClick}
      disabled={isRunning}
      initial={{ scale: 0, rotate: 180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1, boxShadow: "0 0 20px #00ff9d" }}
      whileTap={{ scale: 0.95 }}
    >
      {isRunning ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={20} />
          </motion.div>
          <span className="hud-text">EXECUTING...</span>
        </>
      ) : (
        <>
          <Play size={20} fill="currentColor" />
          <span className="hud-text">RUN_CODE</span>
        </>
      )}
    </motion.button>
  );
};

export default FloatingRunButton;
