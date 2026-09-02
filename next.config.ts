import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-ical (et sa dépendance rrule) ne supporte pas le bundling Turbopack
  serverExternalPackages: ["node-ical"],
  // Tunnel de réservation en ligne pas encore ouvert au public : /book est
  // temporairement dérouté vers la page de contact direct. Redirection 307
  // (permanent: false) pour ne pas être mise en cache par les navigateurs —
  // il suffira de supprimer ce bloc pour rouvrir la réservation en ligne.
  async redirects() {
    return [
      {
        source: "/book",
        destination: "/reservation-contact",
        permanent: false,
      },
    ];
  },
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
