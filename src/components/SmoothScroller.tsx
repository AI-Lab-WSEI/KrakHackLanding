'use client';

import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { ReactNode, useEffect, useRef } from 'react';

interface SmoothScrollerProps {
  children: ReactNode;
}

export default function SmoothScroller({ children }: SmoothScrollerProps) {
  // Reference to store the request animation frame ID for cleanup
  const rafRef = useRef<number | null>(null);
  // Reference to store the Lenis instance
  const lenisRef = useRef<any>(null);

  // Configuration options for the Lenis scrolling
  const lenisOptions = {
    // Lower values make the scrolling more responsive, higher values make it smoother (more inertia)
    lerp: 0.1,
    // Duration of the scrolling animation in seconds
    duration: 1.2,
    // Multiplier for wheel events (higher values = faster scrolling)
    wheelMultiplier: 1.0,
    // Whether to enable smooth scrolling for touch-based devices
    // Disabled by default as it can interfere with native touch scrolling
    smoothTouch: false,
    // Whether to enable smooth scrolling for mouse wheel
    smoothWheel: true,
    // Enable smooth scrolling on the whole page
    infinite: false,
    // Optional: Custom easing function for even more control
    // easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  };

  // Access the Lenis instance to set up animation loop
  useLenis((lenis) => {
    // Store the Lenis instance in our ref for use in the animation loop
    if (lenis && !lenisRef.current) {
      lenisRef.current = lenis;
    }
  });

  // Set up the animation loop using requestAnimationFrame
  useEffect(() => {
    if (!lenisRef.current) return;

    // Function to execute during each animation frame
    function raf(time: number) {
      lenisRef.current?.raf(time);
      // Continue the animation loop
      rafRef.current = requestAnimationFrame(raf);
    }

    // Start the animation loop
    rafRef.current = requestAnimationFrame(raf);

    // Cleanup function: cancel animation frame when component unmounts
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Cast children to any to resolve type conflicts between React versions
  return (
    <ReactLenis root options={lenisOptions}>
      {children as any}
    </ReactLenis>
  );
} 