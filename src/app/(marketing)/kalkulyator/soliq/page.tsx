import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { MarketplaceTaxCalculator } from "@/features/calculators/marketplace-tax-calculator";

export const metadata: Metadata = {
  title: "O'zbekiston Marketpleys Soliq Kalkulyatori (YaTT & MChJ 4%) | eStats",
  description:
    "Uzum Market, Wildberries va Yandex sotuvchilari uchun soliq hisoblash kalkulyatori: YaTT 4% aylanma soliq, elektron tijorat 1% imtiyozi, ijtimoiy soliq va 1 mlrd so'mlik QQS chegarasi.",
  keywords: [
    "marketpleys soliq kalkulyator",
    "uzum soliq hisoblash",
    "yatt 4 foiz aylanma soliq",
    "marketpleys qqs 12 foiz limiti",
    "uzumda savdo qilish soliqlar 2026",
    "soliq uzum market chek",
    "ijtimoiy soliq yatt bhm",
  ],
  alternates: {
    canonical: "/kalkulyator/soliq",
    languages: {
      uz: "/kalkulyator/soliq",
      ru: "/ru/kalkulyator/soliq",
    },
  },
  openGraph: {
    title: "O'zbekiston Marketpleys Soliq Kalkulyatori (2026) — eStats",
    description: "YaTT va MChJlar uchun aylanma soliq, ijtimoiy soliq va QQS xavfini 1 daqiqada hisoblang.",
    url: "https://estats.uz/kalkulyator/soliq",
  },
};

const FAQ_ITEMS = [
  {
    question: "Uzum Market sotuvchilari qanday soliq to'laydi?",
    answer:
      "O'zbekistonda yakka tartibdagi tadbirkor (YaTT) yoki MChJ sifatida ro'yxatdan o'tgan marketpleys sotuvchilari aylanmadan 4% soliq (elektron tijorat talablariga mos kelganda 1-2% imtiyozli stavka) hamda YaTT uchun oyiga 1 BHM miqdorida ijtimoiy soliq to'laydi.",
  },
  {
    question: "Soliq umumiy tushumdan olinadimi yoki komissiya ayirilgandan keyinmi?",
    answer:
      "Soliq kodeksiga muvofiq, aylanmadan olinadigan soliq xaridor to'lagan jami chek summasidan hisoblanadi. Uzum Market ushlab qolgan komissiya va logistika xarajatlari soliq bazasidan chegirilmaydi.",
  },
  {
    question: "Qachon 12% QQS (Qo'shilgan qiymat solig'i) to'lash majburiyati paydo bo'ladi?",
    answer:
      "Agar sotuvchining yillik aylanmasi (oxirgi 12 oy davomida) 1 milliard so'mdan oshsa, u avtomatik ravishda umumiy soliq tizimiga o'tadi va 12% QQS hamda foyda solig'i to'lovchisiga aylanadi.",
  },
];

export default function TaxCalculatorPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/uzum-komissiya" },
          { name: "Marketpleys soliq kalkulyatori", url: "/kalkulyator/soliq" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <MarketplaceTaxCalculator locale="uz" />
    </article>
  );
}
