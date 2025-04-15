import SmoothScroller from '@/components/SmoothScroller';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js App with Smooth Scrolling',
  description: 'Next.js application with smooth scrolling using Lenis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SmoothScroller>
          {children}
        </SmoothScroller>
      </body>
    </html>
  );
}
