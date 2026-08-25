import { redirect } from "next/navigation";

/**
 * Auditoriya alohida sahifa emas: obunachilar soni "Ijtimoiy tarmoqlar"
 * bo'limining tepasidagi qatorda ko'rinadi. Manzil eski havolalar uchun
 * qoldirilgan.
 */
export default function NetworksRedirect() {
  redirect("/socials");
}
