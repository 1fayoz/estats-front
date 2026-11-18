import type { NextConfig } from "next";

import { buildCsp } from "./src/config/csp";
import { PRIVATE_ROUTE_SEGMENTS } from "./src/config/private-routes";

// Brauzer chaqiradigan API'lar — `src/lib/api.ts`, `lens.ts`, `market.ts`
// bilan bir xil manbalar. Build vaqtida o'qiladi (NEXT_PUBLIC_*).
const CSP = buildCsp({
  apiUrls: [
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
    process.env.NEXT_PUBLIC_LENS_API,
    process.env.NEXT_PUBLIC_MARKET_API,
  ],
  dev: process.env.NODE_ENV !== "production",
});

/** Har bir javobga qo'shiladigan xavfsizlik sarlavhalari. */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Batafsil va nega qisman report-only — `src/config/csp.ts`.
  { key: "Content-Security-Policy", value: CSP.enforced },
  { key: "Content-Security-Policy-Report-Only", value: CSP.reportOnly },
];

const nextConfig: NextConfig = {
  // Docker image uchun: `.next/standalone` ichida faqat kerakli fayllar bo'ladi,
  // ya'ni prod image'ga butun node_modules ko'chirilmaydi.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // Optimizator FAQAT o'z `public/` rasmlarimiz uchun (logo, landing
    // skrinshotlari). Tovar rasmlari oddiy `<img>` bilan to'g'ridan-to'g'ri
    // Uzum CDN'idan olinadi, ya'ni `remotePatterns` kerak emas — u esa
    // `/_next/image` ga sotuvchi yuklagan begona fayllarni berish
    // imkonini (SSRF, libvips/AVIF RCE advisory'lari) ochib qo'yardi.
    // AVIF ham o'chirilgan: GHSA-2xp9-vwfh-vxw4 aynan AVIF yo'lida.
    // next 16.4.6+ ga o'tilgach qayta ko'rib chiqilsin.
    formats: ["image/webp"],
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
