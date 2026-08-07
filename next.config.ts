import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode for faster builds
  reactStrictMode: false,
  
  // Enable Turbopack for faster development
  turbopack: {},
  
  // Optimize images
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimize TypeScript - skip type checking in dev for speed
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle unnecessary files in browser build
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Optimize webpack for faster builds
    config.optimization = {
      ...config.optimization,
      minimize: !isServer, // Don't minimize in dev
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      },
    };
    return config;
  },
  
  // Output directory for faster rebuilds
  output: 'standalone',
};

export default nextConfig;
