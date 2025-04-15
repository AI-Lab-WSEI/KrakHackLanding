'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useLenis } from '@/hooks/useSmoothScroll';

type ParallaxBackgroundProps = {
  imageSrc: string; // Required for this simpler version
  alt?: string;
  verticalSpeed?: number;
  opacity?: number;
  blurAmount?: number;
  className?: string;
};

export default function ParallaxBackground({
  imageSrc,
  alt = "Background",
  verticalSpeed = 0.1,
  opacity = 0.2,
  blurAmount = 0,
  className = "",
}: ParallaxBackgroundProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  
  useLenis(({ scroll }) => {
    if (bgRef.current) {
      const translateY = scroll * verticalSpeed;
      bgRef.current.style.transform = `translateY(${translateY}px)`;
    }
  });

  return (
    <div 
      ref={bgRef} 
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ 
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
        zIndex: 0, 
        willChange: 'transform', 
      }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        style={{ 
          objectFit: 'cover', 
          opacity: opacity 
        }}
        priority // Load background images eagerly
      />
    </div>
  );
} 