import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { ChinaCargoCalculator } from "@/features/calculators/china-cargo-calculator";

export const metadata: Metadata = {
  title: "Калькулятор Карго и Себестоимости из Китая (1688 / Taobao) | eStats",
  description:
    "Точный онлайн расчет себестоимости товаров из Китая под ключ: курс юаня, доставка карго за кг, страховка, упаковка и розничная цена на Uzum Market.",
  keywords: [
    "калькулятор карго из китая",
    "себестоимость 1688 узбекистан",
    "доставка таобао ташкент карго",
    "расчет стоимости груза из китая за кг",
    "маржа uzum market товары из китая",
    "тарифы карго китай узбекистан",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/kargo",
    languages: {
      uz: "/kalkulyator/kargo",
      ru: "/ru/kalkulyator/kargo",
    },
  },
  openGraph: {
    title: "Калькулятор Себестоимости и Карго из Китая — eStats",
    description: "Рассчитайте точную себестоимость единицы товара в Ташкенте с учетом карго и расходов.",
    url: "https://estats.uz/ru/kalkulyator/kargo",
  },
};

const FAQ_ITEMS = [
  {
    question: "Что входит в полную себестоимость товара из Китая?",
    answer:
      "Себестоимость под ключ включает цену товара на 1688, доставку по Китаю до склада перевозчика, тариф карго до Ташкента (авто или авиа), страховку (1-2%), термоэтикетки и упаковку, а также запас на возможный брак.",
  },
  {
    question: "Что выгоднее: авто-доставка или авиа-карго?",
    answer:
      "Авто- и ЖД доставка обходится в среднем в $3.5–$5 за кг при сроках 14–22 дня, что оптимально для одежды, товаров для дома и тяжелых позиций. Авиа карго ($6.5–$8.5/кг, 5–8 дней) подходит для срочных трендовых новинок и малогабаритной электроники.",
  },
  {
    question: "Какую наценку ставить для продажи на маркетплейсе Uzum?",
    answer:
      "Учитывая среднюю комиссию маркетплейса (15–25%), для чистой рентабельности в 40–50% рекомендуемая розничная цена должна быть выше себестоимости в 2–2.5 раза.",
  },
];

export default function RuCargoCalculatorPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Карго и себестоимость из Китая", url: "/ru/kalkulyator/kargo" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <ChinaCargoCalculator locale="ru" />
    </article>
  );
}
