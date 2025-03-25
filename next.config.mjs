/** @type {import('next').NextConfig} */
const nextConfig = {
  output:
    process.env.BUILD_OUTPUT === "default" || !process.env.BUILD_OUTPUT
      ? undefined
      : process.env.BUILD_OUTPUT,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config

    // Exclude .community directory from being bundled into the serverless function
    config.externals.push(/\.community/);

    return config;
  },
  outputFileTracingExcludes: {
    "/*": [".community"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.multiavatar.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "ipfs.internal.citizenwallet.xyz",
        port: "",
      },
      {
        protocol: "https",
        hostname: "assets.citizenwallet.xyz",
        port: "",
      },
    ],
  },
};

export default nextConfig;
