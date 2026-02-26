/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to support dynamic routes with database queries
  // This enables proper SEO-friendly slug-based URLs for blog posts
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
