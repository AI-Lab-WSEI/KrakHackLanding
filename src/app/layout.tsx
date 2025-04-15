'use client';

import { Suspense } from 'react';
import { Lenis } from '@studio-freight/react-lenis';
import type { Metadata } from "next";
import "./globals.css"; // Ensure globals are imported

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> 
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" 
        />
      </head>
      {/* Remove inline style, rely on globals.css */}
      <body> 
        <Suspense fallback={null}>
          <Lenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
            {children}
          </Lenis>
        </Suspense>
      </body>
    </html>
  );
}
