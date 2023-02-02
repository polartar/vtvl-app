/* eslint-disable no-undef */
/** @type {import('next').NextConfig} */
/** @type {import('dotenv').Config} */

const nextConfig = {
  env: {
    VERCEL_ENV: process.env.VERCEL_ENV
  },
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack']
    });
    // Module for loading markdown files
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader'
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/onboarding',
        permanent: true
      },
      {
        source: '/onboarding/setup-safes',
        destination: '/settings?tab=safe',
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
