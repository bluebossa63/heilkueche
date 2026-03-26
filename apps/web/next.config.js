/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['spicyhealthmediaprod.blob.core.windows.net'],
  },
};

module.exports = nextConfig;
