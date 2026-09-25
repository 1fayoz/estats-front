import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { CalculatorsHub } from "@/features/calculators/calculators-hub";

export const metadata: Metadata = {
  title: "Бесплатные Онлайн Калькуляторы для Маркетплейсов (2026) | eStats",
  description:
    "12+ бесплатных инструментов для селлеров Uzum Market, Wildberries и Ozon: расчет себестоимости карго из Китая, налогов, комиссии, термоэтикеток 58х40, акта FBO и юнит-экономики.",
  keywords: [
    "калькуляторы маркетплейсов узбекистан",
    "калькулятор комиссии uzum market",
    "калькулятор карго из китая онлайн",
    "налоговый калькулятор селлера",
    "генератор штрихкодов 58х40",
    "акт приема передачи fbo накладная",
  ],
  alternates: {
    canonical: "/ru/kalkulyator",
    languages: {
      uz: "/kalkulyator",
      ru: "/ru/kalkulyator",
      en: "/en/tools",
    },
  },
  openGraph: {
    title: "Бесплатные Онлайн Калькуляторы для Маркетплейсов — eStats",
    description: "Все калькуляторы для селлеров: карго, налоги, комиссия, акты и штрихкоды.",
    url: "https://estats.uz/ru/kalkulyator",
    images: ["https://estats.uz/api/og?title=Калькуляторы+для+Маркетплейсов&badge=eStats+Инструменты"],
  },
};

const FAQ_ITEMS = [
  {
    question: "Бесплатны ли эти калькуляторы?",
    answer:
      "Да, все калькуляторы и генераторы eStats полностью бесплатны, не требуют регистрации и доступны без ограничений с любого устройства.",
  },
  {
    question: "Подходят ли расчеты для Uzum Market и Wildberries?",
    answer:
      "Да, формулы учитывают актуальные регламенты, ставки налогов Узбекистана (4%), комиссии маркетплейсов 2026 года и требования к маркировке.",
  },
  {
    question: "Чем отличается платформа eStats от калькуляторов?",
    answer:
      "Калькуляторы предназначены для разовых расчетов. Платформа eStats автоматически подключается к API ваших магазинов и ведет сквозной учет партий по FIFO, отслеживает остатки и считает реальный PnL.",
  },
];

export default function RuCalculatorsHubPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <CalculatorsHub locale="ru" />
    </article>
  );
}
