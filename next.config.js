/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Ensure static export for GitHub Pages
  basePath: '',
  assetPrefix: '',
};

module.exports = nextConfig;
