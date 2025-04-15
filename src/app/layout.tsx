'use client';

import { Suspense } from 'react';
import type { Metadata } from "next";
import "./globals.css"; // Ensure globals are imported
import SmoothScroller from '@/components/SmoothScroller';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" 
        />
      </head>
      {/* Remove inline style, rely on globals.css */}
      <body> 
        <Suspense fallback={null}>
          <SmoothScroller options={{ duration: 1.5, smoothWheel: true }}>
            {children}
          </SmoothScroller>
        </Suspense>
      </body>
    </html>
  );
}
