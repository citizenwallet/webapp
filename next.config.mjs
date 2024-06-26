/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config

    // Exclude .community directory from being bundled into the serverless function
    config.externals.push(/\.community/);

    return config;
  },
  experimental: {
    outputFileTracingExcludes: {
      "/*": [".community"],
    },
  },
};

export default nextConfig;
