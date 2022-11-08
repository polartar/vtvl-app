/** @type {import('next').NextConfig} */
/** @type {import('dotenv-flow').config} */

const env = {}
Object.keys(process.env).forEach((key) => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    env[key] = process.env[key]
  }
})

const nextConfig = {
  env: env,
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
      }
    ];
  }
};

module.exports = nextConfig;
