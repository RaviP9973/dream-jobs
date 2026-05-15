import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns:[
      {
        hostname: "utfs.io",
        port: "",
        protocol: "https",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com", 
      }
    ]
  }
};

export default nextConfig;
