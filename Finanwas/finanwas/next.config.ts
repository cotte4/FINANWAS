import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    // Optimize images with modern formats
    formats: ['image/avif', 'image/webp'],

    // Enable automatic image size detection
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Minimize layout shift with responsive images
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for static images

    // Allow external images from these domains (if needed in the future)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'finanwas.com',
        pathname: '/**',
      },
    ],
  },

  // Compress pages with gzip/brotli
  compress: true,

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Optimize build output
  reactStrictMode: true,
};

export default nextConfig;
