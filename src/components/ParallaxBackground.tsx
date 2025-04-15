'use client';

import { useRef, useEffect } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import Image from 'next/image';

type ParallaxBackgroundProps = {
  imageSrc?: string;
  alt?: string;
  speed?: number;
  opacity?: number;
  blurAmount?: number;
  rotate?: boolean;
  zoom?: boolean;
  className?: string;
  gradientColors?: string[];
};

export default function ParallaxBackground({
  imageSrc,
  alt = "Background",
  speed = 0.1,
  opacity = 0.2,
  blurAmount = 0,
  rotate = false,
  zoom = false,
  className = "",
  gradientColors
}: ParallaxBackgroundProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  
  useLenis(({ scroll }) => {
    if (bgRef.current) {
      let transform = `translateY(${scroll * speed}px)`;
      
      if (rotate) {
        // Slow rotation based on scroll
        transform += ` rotate(${scroll * 0.01}deg)`;
      }
      
      if (zoom) {
        // Subtle zoom effect based on scroll
        const scale = 1 + (scroll * 0.0001);
        transform += ` scale(${scale})`;
      }
      
      bgRef.current.style.transform = transform;
    }
  });

  return (
    <div 
      ref={bgRef} 
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ 
        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined 
      }}
    >
      {gradientColors ? (
        <div 
          className="absolute inset-0 w-full h-full" 
          style={{
            background: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
            opacity: opacity
          }}
        />
      ) : (
        imageSrc && (
          <Image
            src={imageSrc}
            alt={alt}
            fill
            style={{ 
              objectFit: 'cover', 
              opacity: opacity 
            }}
          />
        )
      )}
    </div>
  );
} 