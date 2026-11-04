import type { NextConfig } from "next";

import {
  AUTH_PREFIX,
  DASHBOARD_HOME,
  DASHBOARD_PREFIX,
  LEGACY_DASHBOARD_SEGMENTS,
  LOGIN_PATH,
} from "./src/config/private-routes";

const LEGACY = LEGACY_DASHBOARD_SEGMENTS.join("|");

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
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];

    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Kabinet va kirish — login ortidagi shaxsiy ma'lumot; hech qachon
      // indekslanmasin.
      { source: `${DASHBOARD_PREFIX}/:path*`, headers: noindex },
      { source: `${AUTH_PREFIX}/:path*`, headers: noindex },
    ];
  },

  async redirects() {
    return [
      { source: DASHBOARD_PREFIX, destination: DASHBOARD_HOME, permanent: false },
      // Prefiksdan oldingi manzillar: saqlangan havolalar, bot tugmalari va
      // landing'dagi «Kirish» tugmalari yangi joyga o'tadi.
      { source: "/login", destination: LOGIN_PATH, permanent: true },
      {
        source: `/:segment(${LEGACY})/:path*`,
        destination: `${DASHBOARD_PREFIX}/:segment/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
