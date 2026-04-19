import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    domains: ['covers.openlibrary.org'],
  },
  compiler: {
    styledComponents: true,
  },
  allowedDevOrigins: ['192.168.0.125'],
  
};

export default nextConfig;
