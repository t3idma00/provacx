/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@provacx/api", "@provacx/database", "@provacx/shared"],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

module.exports = nextConfig;
