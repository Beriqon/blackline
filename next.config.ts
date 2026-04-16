import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nomadevillacollection.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
