/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        default: false,
      },
    };
    return config;
  },
  // This helps suppress hydration warnings from browser extensions
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Enable static exports
  output: 'export',
  // Disable image optimization during export
  images: {
    unoptimized: true,
  },
  // Disable trailing slash
  trailingSlash: false,
  // Exclude default routes from static generation
  skipTrailingSlashRedirect: true,
  // Preserve paths during export
  distDir: 'build',
};

module.exports = nextConfig;