'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type ScrollCallback = (params: { scroll: number; limit: number; velocity: number; direction: string; progress: number }) => void;

/**
 * A custom hook that provides Lenis smooth scrolling functionality
 * Compatible with React 19 while maintaining all existing functionality
 */
export function useSmoothScroll(callback?: ScrollCallback) {
  const [lenis, setLenis] = useState<any>(null);
  const requestRef = useRef<number | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Dynamically import Lenis to avoid SSR issues
    const importLenis = async () => {
      try {
        // Try the new package name first
        const lenisModule = await import('lenis');
        // Initialize with the new package format
        const LenisClass = lenisModule.default;
        const instance = new LenisClass({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        //   smooth: true,
        //   smoothTouch: false,
          touchMultiplier: 2,
        });
        setLenis(instance);
        return instance;
      } catch (error) {
        // Fallback to the old package if new one fails
        try {
          const oldLenisModule = await import('@studio-freight/lenis');
          const OldLenisClass = oldLenisModule.default;
          const instance = new OldLenisClass({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            // smooth: true,
            // smoothTouch: false,
            touchMultiplier: 2,
          });
          setLenis(instance);
          return instance;
        } catch (oldError) {
          console.error('Failed to import Lenis:', oldError);
          return null;
        }
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
 * A drop-in replacement for the useLenis hook that works with React 19
 */
export function useLenis(callback?: ScrollCallback) {
  return useSmoothScroll(callback);
}

/**
 * A wrapper component that implements Lenis smooth scrolling
 */
interface ReactLenisProps {
  children: ReactNode;
  root?: boolean;
  options?: Record<string, any>;
}

export function ReactLenis({ children, options = {} }: ReactLenisProps) {
  const requestRef = useRef<number | null>(null);
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import Lenis
    const importLenis = async () => {
      try {
        // Try the new package name first
        const lenisModule = await import('lenis');
        // Initialize with the new package format
        const LenisClass = lenisModule.default;
        return new LenisClass({
          ...options,
          duration: options.duration || 1.2,
          easing: options.easing || ((t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
          smooth: options.smooth !== undefined ? options.smooth : true,
          smoothTouch: options.smoothTouch !== undefined ? options.smoothTouch : false,
        });
      } catch (error) {
        // Fallback to the old package
        try {
          const oldLenisModule = await import('@studio-freight/lenis');
          const OldLenisClass = oldLenisModule.default;
          return new OldLenisClass({
            ...options,
            duration: options.duration || 1.2,
            easing: options.easing || ((t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
            smooth: options.smooth !== undefined ? options.smooth : true,
            smoothTouch: options.smoothTouch !== undefined ? options.smoothTouch : false,
          });
        } catch (oldError) {
          console.error('Failed to import Lenis:', oldError);
          return null;
        }
      }
    };

    importLenis().then((lenisInstance) => {
      if (!lenisInstance) return;
      
      lenisRef.current = lenisInstance;

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
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [options]);

  return <>{children}</>;
}

useEffect(() => {
  if (typeof window === 'undefined') return;
  
  if (callback && lenisInstance) {
    lenisInstance.on('scroll', callback);
  }

  return () => {
    if (callback && lenisInstance) {
      lenisInstance.off('scroll', callback);
    }
  };
}, [callback, lenisInstance]);

return {
  scrollTo: (target: any, options?: any) => {
    lenisInstance!.scrollTo(target, options);
  },
  lenis: lenisInstance,
}; 