# Next.js Smooth Scrolling with Lenis

This project demonstrates how to implement smooth scrolling in a Next.js application using the `lenis` library. The implementation works with both App Router and Pages Router.

## Installation

```bash
# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

## Key Features

- Smooth scrolling with subtle inertia effect (lerp)
- Responsive and optimized for performance
- Works with both App Router and Pages Router
- Custom scroll animations with configurable parameters

## Implementation Details

### SmoothScroller Component

The core of the implementation is the `SmoothScroller` component (`src/components/SmoothScroller.tsx`), which:

- Wraps the main content of the application
- Handles the Lenis instance and animation loop
- Uses requestAnimationFrame for smooth performance
- Properly cleans up resources on unmount

### Configuration Options

The smooth scrolling is configured with the following options:

- `lerp: 0.1` - Controls the smoothness/responsiveness of scrolling
- `duration: 1.2` - Duration of the scrolling animation in seconds
- `wheelMultiplier: 1.0` - Controls scroll speed with mouse wheel
- `smoothTouch: false` - Disabled for touch devices to maintain native feel
- `smoothWheel: true` - Enabled for mouse wheel scrolling

### Integration Examples

#### App Router

The component is integrated in `src/app/layout.tsx`:

```tsx
import SmoothScroller from '@/components/SmoothScroller';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SmoothScroller>
          {children}
        </SmoothScroller>
      </body>
    </html>
  );
}
```

#### Pages Router

The component is integrated in `src/pages/_app.tsx`:

```tsx
import SmoothScroller from '@/components/SmoothScroller';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SmoothScroller>
      <Component {...pageProps} />
    </SmoothScroller>
  );
}
```

### Required CSS

The global CSS in `src/styles/globals.css` includes essential styles to:

- Hide the default browser scrollbar
- Ensure proper smooth scrolling behavior
- Handle various scrolling states and interactions

## Notes

- The smooth scrolling effect is only applied on the client-side (`'use client'` directive)
- For best performance, minimize DOM operations during scroll events
- Consider disabling for users with reduced motion preferences
- Note: Originally this was implemented with `@studio-freight/react-lenis` which has been renamed to `lenis`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
