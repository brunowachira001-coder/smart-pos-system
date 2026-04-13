/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: false,
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

module.exports = nextConfig;
