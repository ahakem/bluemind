/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Firebase Storage (new bucket domain)
      {
        protocol: 'https',
        hostname: 'bluemind-landing.firebasestorage.app',
      },
      // Firebase Storage (legacy googleapis domain)
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // Google user content (profile photos, Maps photos)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      // Flag CDN used in CountryAutocomplete
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
};

module.exports = nextConfig;
