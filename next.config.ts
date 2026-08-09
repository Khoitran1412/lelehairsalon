import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  compress: true,
};

export default nextConfig;
