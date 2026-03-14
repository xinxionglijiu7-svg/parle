import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/core", "@google-cloud/text-to-speech"],
};

export default nextConfig;
