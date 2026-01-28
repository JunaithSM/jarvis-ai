import React from 'react';
import { motion } from 'framer-motion';
import { Settings, BarChart2 } from 'lucide-react';
import './Header.css';

const Header = ({ progress = 35, lessonTitle = "Arrays & Loops" }) => {
  return (
    <motion.header 
      className="header-island glass-panel"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Brand - Minimalist */}
      <div className="header__brand">
        <div className="logo-circle">
          <div className="logo-inner"></div>
        </div>
        <div className="header__info">
          <h1 className="header__title">FocusFlow</h1>
          <span className="header__lesson">{lessonTitle}</span>
        </div>
      </div>
      
      {/* Zen Progress */}
      <div className="header__center">
        <div className="zen-progress-container">
          <span className="zen-label">Lesson Progress</span>
          <div className="zen-bar-track">
            <motion.div 
              className="zen-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <span className="zen-value">{progress}%</span>
        </div>
      </div>
      
      {/* Actions - Soft Buttons */}
      <div className="header__actions">
        <motion.button 
          className="header__btn"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(227, 213, 197, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          <BarChart2 size={18} />
        </motion.button>
        <motion.button 
          className="header__btn"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(227, 213, 197, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={18} />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;
