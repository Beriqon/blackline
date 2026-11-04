import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {turbopackFileSystemCacheForDev:false},
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  images: {
    remotePatterns: [{protocol:"https",hostname:"hlalndhldrjcnohuegiw.supabase.co",pathname:"/storage/v1/object/public/website-media/**"},
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
