import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { CalculatorsHub } from "@/features/calculators/calculators-hub";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Бесплатные Калькуляторы для Маркетплейсов (2026)",
  description:
    "12+ бесплатных инструментов для селлеров Uzum, Wildberries и Ozon: карго из Китая, налоги, комиссия, термоэтикетки 58х40, акт FBO и юнит-экономика.",
  path: "/ru/kalkulyator",
  keywords: [
    "калькуляторы маркетплейсов узбекистан",
    "калькулятор комиссии uzum market",
    "калькулятор карго из китая онлайн",
    "налоговый калькулятор селлера",
    "генератор штрихкодов 58х40",
    "акт приема передачи fbo накладная",
  ],
  ogTitle: "Бесплатные Онлайн Калькуляторы для Маркетплейсов — eStats",
  ogDescription: "Все калькуляторы для селлеров: карго, налоги, комиссия, акты и штрихкоды.",
});

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
