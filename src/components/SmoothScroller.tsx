'use client';

import { ReactNode } from 'react';
import { SmoothScroller as LenisScroller } from '@/hooks/useSmoothScroll';

interface SmoothScrollerProps {
  children: ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    touchMultiplier?: number;
    wheelMultiplier?: number;
    smoothWheel?: boolean;
    syncTouch?: boolean;
    syncTouchLerp?: number;
  };
}

export default function SmoothScroller({ children, options = {} }: SmoothScrollerProps) {
  return (
    <LenisScroller options={options}>
      {children}
    </LenisScroller>
  );
} 