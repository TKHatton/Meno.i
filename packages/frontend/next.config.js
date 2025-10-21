/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@menoai/shared'],
  webpack: (config, { isServer }) => {
    // Exclude posthog-js from server-side bundle to avoid Node.js module issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('posthog-js');
    }
    return config;
  },
}

module.exports = nextConfig
