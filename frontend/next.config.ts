import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
