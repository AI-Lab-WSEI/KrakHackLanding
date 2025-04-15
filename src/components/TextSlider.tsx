'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TextSlider.module.css'; // We'll create this CSS file next

type TextSliderProps = {
  sentences: string[];
  colors: string[];
  interval?: number; // Time in ms for each sentence
};

const TextSlider = ({ 
  sentences, 
  colors, 
  interval = 5000 // Default 5 seconds
}: TextSliderProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % sentences.length);
    }, interval);

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [sentences.length, interval]);

  // Animation variants for Framer Motion
  const variants = {
    enter: {
      y: 30,
      opacity: 0,
    },
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
    },
    exit: {
      zIndex: 0,
      y: -30,
      opacity: 0,
    },
  };

  return (
    <div className={styles.sliderContainer}>
      <AnimatePresence initial={false} mode="wait">
        <motion.p
          key={index} // Important for AnimatePresence to track changes
          className={styles.sliderText}
          style={{ color: colors[index % colors.length] }} // Cycle through colors
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ y: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.5 } }}
        >
          {sentences[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default TextSlider; 