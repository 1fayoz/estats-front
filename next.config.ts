import type { NextConfig } from "next";

import { PRIVATE_ROUTE_SEGMENTS } from "./src/config/private-routes";

/** Har bir javobga qo'shiladigan xavfsizlik sarlavhalari. */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Docker image uchun: `.next/standalone` ichida faqat kerakli fayllar bo'ladi,
  // ya'ni prod image'ga butun node_modules ko'chirilmaydi.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // Tovar rasmlari Uzum CDN'idan keladi.
    remotePatterns: [{ protocol: "https", hostname: "images.uzum.uz" }],
    formats: ["image/avif", "image/webp"],
  },
  typedRoutes: false,

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        // Kabinet va kirish — login ortidagi shaxsiy ma'lumot; hech qachon
        // indekslanmasin. Ro'yxat `src/config/private-routes.ts` da.
        source: `/:path(${PRIVATE_ROUTE_SEGMENTS.join("|")})/:rest*`,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
