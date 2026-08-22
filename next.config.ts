import type { NextConfig } from "next";

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
        // Kabinet — sotuvchining moliyaviy ma'lumoti; hech qachon indekslanmasin.
        source: "/:path(warehouse|intakes|pnl|finance|settings)/:rest*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
