'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface LenisScrollEvent {
  scroll: number;
  limit: number;
  velocity: number;
  direction: number | null;
  progress: number;
}

type ScrollCallback = (event: LenisScrollEvent) => void;

interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  touchMultiplier?: number;
  wheelMultiplier?: number;
  smoothWheel?: boolean;
  syncTouch?: boolean;
  syncTouchLerp?: number;
  smoothTouch?: boolean;
}

/**
 * Check if the current device is a touch device
 */
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * A custom hook that provides Lenis smooth scrolling functionality
 * Using only the standard Lenis package
 */
export function useSmoothScroll(callback?: ScrollCallback) {
  const [lenis, setLenis] = useState<any>(null);
  const requestRef = useRef<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    if (typeof window === 'undefined') return;
    
    // Different configuration for touch devices instead of skipping
    const isMobile = isTouchDevice();

    // Dynamically import Lenis to avoid SSR issues
    const importLenis = async () => {
      try {
        const lenisModule = await import('lenis');
        const LenisClass = lenisModule.default;
        
        // Configure Lenis based on device type
        const lenisOptions = isMobile 
          ? {
              duration: 0.8,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              touchMultiplier: 0.5,
              smoothWheel: false,
              smoothTouch: false,
              syncTouch: true,
            }
          : {
              duration: 1.2,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              touchMultiplier: 2,
              smoothWheel: true,
            };
        
        const instance = new LenisClass(lenisOptions);
        setLenis(instance);
        return instance;
      } catch (error) {
        console.error('Failed to import Lenis:', error);
        return null;
      }
    };

    importLenis().then((lenisInstance) => {
      if (!lenisInstance) return;

      // Set up the animation loop
      function raf(time: number) {
        lenisInstance.raf(time);
        requestRef.current = requestAnimationFrame(raf);
      }
      requestRef.current = requestAnimationFrame(raf);
    });

    return () => {
      // Cleanup
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  // Execute callback when scroll position changes
  useEffect(() => {
    if (!lenis || !callback) return;

    // Add scroll event listener
    lenis.on('scroll', callback);

    return () => {
      // Remove listener on cleanup
      lenis.off('scroll', callback);
    };
  }, [lenis, callback]);

  return lenis;
}

/**
 * A drop-in replacement for the useLenis hook
 */
export function useLenis(callback?: ScrollCallback) {
  return useSmoothScroll(callback);
}

/**
 * A wrapper component that implements Lenis smooth scrolling
 */
interface SmoothScrollerProps {
  children: ReactNode;
  options?: LenisOptions;
}

export function SmoothScroller({ children, options = {} }: SmoothScrollerProps) {
  const [lenis, setLenis] = useState<any>(null);
  const requestRef = useRef<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || typeof window === 'undefined') return;
    initialized.current = true;

    // Different configuration for touch devices instead of skipping
    const isMobile = isTouchDevice();

    const initLenis = async () => {
      try {
        const lenisModule = await import('lenis');
        const LenisClass = lenisModule.default;
        
        // Default options based on device type
        const defaultOptions = isMobile 
          ? {
              duration: 0.8,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              touchMultiplier: 0.5,
              smoothWheel: false,
              smoothTouch: false,
              syncTouch: true,
            }
          : {
              duration: 1.2,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              touchMultiplier: 2,
              smoothWheel: true,
            };
        
        const instance = new LenisClass({
          ...defaultOptions,
          ...options
        });
        
        setLenis(instance);
        
        // Set up the animation loop
        function raf(time: number) {
          instance.raf(time);
          requestRef.current = requestAnimationFrame(raf);
        }
        requestRef.current = requestAnimationFrame(raf);
      } catch (error) {
        console.error('Failed to initialize Lenis:', error);
      }
    };

    initLenis();

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, [options]);

  return <>{children}</>;
}
