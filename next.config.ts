import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-ical (et sa dépendance rrule) ne supporte pas le bundling Turbopack
  serverExternalPackages: ["node-ical"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
