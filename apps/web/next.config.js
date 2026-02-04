const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@provacx/api",
    "@provacx/database",
    "@provacx/shared",
    "@provacx/ui",
    "@provacx/drawing-engine",
    "@provacx/boq-engine",
    "@provacx/document-editor",
  ],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  webpack: (config, { isServer }) => {
    // Handle canvas module for Konva (required for SSR compatibility)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    } else {
      // Server-side: externalize canvas to avoid bundling issues
      config.externals = [...(config.externals || []), { canvas: "canvas" }];

      // Copy Prisma engine files for serverless deployment
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                __dirname,
                "../../node_modules/.prisma/client/*.node"
              ),
              to: path.join(__dirname, ".next/server/[name][ext]"),
              noErrorOnMissing: true,
            },
            {
              from: path.join(
                __dirname,
                "../../node_modules/.prisma/client/*.node"
              ),
              to: path.join(__dirname, ".next/[name][ext]"),
              noErrorOnMissing: true,
            },
          ],
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
