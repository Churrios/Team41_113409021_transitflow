import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允許 Cloudflare 等隧道存取 Dev 資源
  allowedDevOrigins: [
    "likewise-alan-alberta-bryant.trycloudflare.com",
    "small-snails-wear.loca.lt"
  ]
};

export default nextConfig;
