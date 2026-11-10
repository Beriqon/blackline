import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/api/balance/confirmation": ["./public/fonts/NotoSans.ttf"], "/api/orders/confirmation": ["./public/fonts/NotoSans.ttf"],"/api/zelle/confirmation":["./public/fonts/NotoSans.ttf"] },
  outputFileTracingExcludes: {
    "/api/*/confirmation": ["./public/**/*.{jpg,jpeg,png,webp,avif,gif,svg,mp4,mov,webm}"],
  },
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
