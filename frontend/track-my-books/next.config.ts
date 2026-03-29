import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    domains: ['covers.openlibrary.org'],
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
