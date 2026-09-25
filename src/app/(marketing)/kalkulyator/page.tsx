import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { CalculatorsHub } from "@/features/calculators/calculators-hub";

export const metadata: Metadata = {
  title: "Marketpleyslar Uchun Bepul Onlayn Kalkulyatorlar (2026) | eStats",
  description:
    "Uzum Market, Wildberries va Ozon sotuvchilari uchun 12+ ta bepul professional kalkulyator: Xitoy kargo, soliq, FBO akt, shtrix-kod, komissiya, unit iqtisodiyoti va ABC tahlili.",
  keywords: [
    "uzum kalkulyatorlar",
    "marketpleys kalkulyatorlari bepul",
    "uzum komissiya kalkulyatori",
    "xitoy kargo kalkulyator",
    "marketpleys soliq kalkulyatori",
    "shtrix kod generatsiya",
    "fbo akt yaratish",
    "abc tahlil kalkulyator",
  ],
  alternates: {
    canonical: "/kalkulyator",
    languages: {
      uz: "/kalkulyator",
      ru: "/ru/kalkulyator",
      en: "/en/tools",
    },
  },
  openGraph: {
    title: "Marketpleyslar Uchun Bepul Onlayn Kalkulyatorlar — eStats",
    description: "12+ bepul onlayn vositalar: tan narx, komissiya, soliq, kargo va ombor hisoblari.",
    url: "https://estats.uz/kalkulyator",
    images: ["https://estats.uz/api/og?title=Bepul+Marketpleys+Kalkulyatorlari&badge=eStats+Tools+Hub"],
  },
};

const FAQ_ITEMS = [
  {
    question: "Kalkulyatorlardan foydalanish bepulmi?",
    answer:
      "Ha, eStats kalkulyatorlari barcha marketpleys sotuvchilari uchun mutlaqo bepul, cheklovlarsiz va ro'yxatdan o'tmasdan foydalanish mumkin.",
  },
  {
    question: "Ushbu kalkulyatorlar qaysi marketpleyslar uchun mos?",
    answer:
      "Uzum Market, Wildberries, Yandex Market va Ozon platformalarining rasmiy komissiyalari, 3:4 o'lchamlari va O'zbekiston soliq stavkalariga to'liq moslangan.",
  },
  {
    question: "eStats asosiy dasturi kalkulyatorlardan nimasi bilan farq qiladi?",
    answer:
      "Kalkulyatorlar bitta tovar yoki partiya bo'yicha tezkor hisoblash uchun mo'ljallangan. eStats ERP tizimi esa barcha do'konlaringizni API orqali ulab, minglab tovarlarning FIFO tan narxi, ombor partiyalari va real sof foydasini avtomatik yuritadi.",
  },
];

export default function CalculatorsHubPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <CalculatorsHub locale="uz" />
    </article>
  );
}
