import type { Metadata } from "next";
import Link from "next/link";

import { LandingFooter } from "@/features/landing/components/footer";
import { LandingHeader } from "@/features/landing/components/landing-header";
import styles from "@/features/landing/components/landing.module.css";

// `noindex` ni Next 404 uchun o'zi qo'yadi — bu yerda takrorlanmaydi.
export const metadata: Metadata = {
  title: "Sahifa topilmadi",
};

const LINKS = [
  { href: "/kalkulyator", label: "Bepul kalkulyatorlar", note: "Komissiya, unit iqtisodiyot, kargo, soliq va boshqalar" },
  { href: "/kalkulyator/uzum-komissiya", label: "Uzum komissiya kalkulyatori", note: "Sof foydani bir daqiqada hisoblang" },
  { href: "/tekshirish", label: "Uzum tovar skaneri", note: "Havola orqali sotuv va qoldiqni ko'ring" },
  { href: "/qollanma", label: "Qo'llanmalar", note: "Do'kon ochish, kartochka SEO, Boost TOP" },
  { href: "/lugat", label: "Marketpleys lug'ati", note: "FIFO, DRR, FBO, FBS atamalari" },
];

/**
 * 404 — o'zbekcha. Ilgari Next'ning inglizcha standart sahifasi chiqardi va
 * u bosh sahifa kanonigini meros olardi. Endi odam (va bot) foydali
 * bo'limlarga qaytadi.
 */
export default function NotFound() {
  return (
    <div className={`landing-light ${styles.page}`}>
      <LandingHeader />
      <main className="mx-auto min-h-[60vh] w-full max-w-3xl px-5 py-16 sm:py-24">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Sahifa topilmadi</h1>
        <p className="mt-4 text-base text-muted-foreground">
          Bu manzil o&apos;zgargan yoki o&apos;chirilgan. Quyidagi bo&apos;limlardan birini oching yoki{" "}
          <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
            bosh sahifaga
          </Link>{" "}
          qayting.
        </p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="block rounded-2xl border bg-card p-4 transition hover:border-primary/40">
                <span className="block font-semibold">{l.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{l.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <LandingFooter />
    </div>
  );
}
