import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, ArrowRight } from 'lucide-react';
import './VisualExplanation.css';

const VisualExplanation = () => {
  return (
    <div className="visual-panel hud-border">
      {/* Decorative Corner Flashes */}
      <div className="corner-flash top-right"></div>
      <div className="corner-flash bottom-left"></div>

      <div className="visual-panel__header">
        <div className="panel-title-group">
          <Activity size={18} className="panel-icon" />
          <span className="panel-title hud-text">ALGORITHM_VISUALIZER</span>
        </div>
      </div>
      
      <div className="visual-panel__content custom-scroll">
        {/* Algorithm Visualization */}
        <section className="visual-section glass-panel">
          <h3 className="visual-section__title">
            <Database size={14} />
            DATA_STRUCTURE_VIEW
          </h3>
          
          <div className="array-visualization">
            <div className="array-row">
              {[3, 7, 2, 9, 1, 5].map((num, idx) => (
                <motion.div 
                  key={idx} 
                  className={`array-cell ${idx === 3 ? 'array-cell--highlight' : ''} ${idx < 3 ? 'array-cell--visited' : ''}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                >
                  <span className="array-cell__value">{num}</span>
                  <span className="array-cell__index">i:{idx}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="visualization-legend">
            <div className="legend-item">
              <span className="legend-marker legend-marker--visited"></span>
              <span className="legend-label">SCANNED</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker legend-marker--current"></span>
              <span className="legend-label">ACTIVE</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker legend-marker--max"></span>
              <span className="legend-label">MAX_VAL</span>
            </div>
          </div>
        </section>

        {/* Step by Step */}
        <section className="visual-section glass-panel">
          <h3 className="visual-section__title">
            <ArrowRight size={14} />
            EXECUTION_TRACE_LOG
          </h3>
          
          <div className="trace-steps">
            <motion.div 
              className="trace-step trace-step--complete"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="trace-step__marker"></div>
              <div className="trace-step__content">
                <span className="trace-step__title">INIT MAX = ARR[0]</span>
                <span className="trace-step__value">MAX: 3</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="trace-step trace-step--complete"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="trace-step__marker"></div>
              <div className="trace-step__content">
                <span className="trace-step__title">COMPARE ARR[1] &gt; MAX</span>
                <span className="trace-step__value">7 &gt; 3 :: UPDATE MAX</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="trace-step trace-step--active"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="trace-step__marker"></div>
              <div className="trace-step__content">
                <span className="trace-step__title">COMPARE ARR[3] &gt; MAX</span>
                <span className="trace-step__value">PROCESSING...</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Variable State */}
        <section className="visual-section glass-panel">
          <h3 className="visual-section__title">MEMORY_STATE</h3>
          
          <div className="variable-display">
            <motion.div 
              className="variable-card"
              whileHover={{ scale: 1.05, borderColor: "var(--neon-purple)" }}
            >
              <span className="variable-card__name">MAX</span>
              <span className="variable-card__value text-glow">7</span>
            </motion.div>
            <motion.div 
              className="variable-card"
              whileHover={{ scale: 1.05, borderColor: "var(--neon-cyan)" }}
            >
              <span className="variable-card__name">ITERATOR(i)</span>
              <span className="variable-card__value">3</span>
            </motion.div>
            <motion.div 
              className="variable-card"
              whileHover={{ scale: 1.05, borderColor: "var(--neon-blue)" }}
            >
              <span className="variable-card__name">ARR[i]</span>
              <span className="variable-card__value">9</span>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VisualExplanation;
