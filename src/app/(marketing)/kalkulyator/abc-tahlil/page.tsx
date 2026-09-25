import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { AbcAnalysisCalculator } from "@/features/calculators/abc-analysis-calculator";

export const metadata: Metadata = {
  title: "ABC Tahlil Kalkulyatori (Pareto 80/20 Qoidasi) — Tovar Portfeli Auditi | eStats",
  description:
    "Uzum Market va marketpleys tovarlaringizni A (80% tushum), B (15%) va C (5%) guruhlarga onlayn ajrating. Asosiy daromad keltiruvchi tovarlar va o'lik zaxirani aniqlang.",
  keywords: [
    "abc tahlil kalkulyator",
    "pareto qoidasi marketpleys",
    "tovar matritsasi auditi",
    "uzum tovar tahlili",
    "ombor zaxirasi abc tahlil",
    "eng kop sotiladigan tovarlarni aniqlash",
  ],
  alternates: {
    canonical: "/kalkulyator/abc-tahlil",
    languages: {
      uz: "/kalkulyator/abc-tahlil",
      ru: "/ru/kalkulyator/abc-tahlil",
      en: "/en/tools/abc-analysis",
    },
  },
  openGraph: {
    title: "ABC Tovar Portfeli va Savdo Tahlili Kalkulyatori — eStats",
    description: "Tovar matritsangizni Pareto 80/20 qoidasi bo'yicha tahlil qiling va daromadni oshiring.",
    url: "https://estats.uz/kalkulyator/abc-tahlil",
    images: ["https://estats.uz/api/og?title=ABC+Tovar+Tahlili+Kalkulyatori&badge=eStats+Tools"],
  },
};

const FAQ_ITEMS = [
  {
    question: "ABC tahlili nima va marketpleysda nega kerak?",
    answer:
      "ABC tahlili Pareto (80/20) tamoyiliga asoslanadi. U barcha tovarlarni tushum ulushiga ko'ra A (80%), B (15%) va C (5%) guruhlariga ajratadi. Bu sotuvchiga pulni qaysi tovarlarga tikish kerakligini va qaysi tovarlar pulni muzlatib yotganini aniq ko'rsatadi.",
  },
  {
    question: "A guruhidagi tovarlar bilan qanday ishlash kerak?",
    answer:
      "A guruhi do'koningizning yuragidir. Ular hech qachon omborda tugab qolmasligi (Out of Stock bo'lmasligi) kerak. Ularga doimiy xavfsiz zaxira va ustuvor kargo yetkazib berish talab etiladi.",
  },
  {
    question: "C guruhidagi tovarlarni nima qilish kerak?",
    answer:
      "C guruhi — bu omborda uzoq vaqt aylanmaydigan, pulni muzlatib qo'ygan tovarlar. Ularni zudlik bilan aksiyalarga qo'shish, katta chegirma qilish yoki boshqa tovarlarga qo'shib (set qilib) sotib yuborish lozim.",
  },
];

export default function AbcAnalysisPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/uzum-komissiya" },
          { name: "ABC Tovar Tahlili", url: "/kalkulyator/abc-tahlil" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <AbcAnalysisCalculator locale="uz" />
    </article>
  );
}
