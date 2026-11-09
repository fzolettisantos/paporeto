import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Raiz do projeto fixa (evita que o Next adote uma pasta acima como raiz).
const projectRoot = dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Build enxuto para rodar em servidor próprio (Docker): `node server.js`.
  output: "standalone",
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  images: {
    formats: ["image/avif", "image/webp"],
    // Caricaturas e charges enviadas pelo painel ficam no Supabase Storage (buckets públicos).
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  // Fontes e caricaturas lidas em tempo de execução pelo gerador de cards.
  outputFileTracingIncludes: {
    "/api/share-card": ["./src/assets/fonts/**", "./public/characters/**"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/rankings/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/characters/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
