import React from 'react';
import { motion } from 'framer-motion';

// This logic is mostly handled in App.js now with inline state, 
// but keeping this component file valid for potential future abstraction or complex nav logic.

const MobileNavigation = ({ activeTab, onTabChange }) => {
  // Currently unused as navigation is embedded in App.js MobileLayout
  // Keeping as a placeholder if we want to extract it later.
  return null; 
};

export default MobileNavigation;
