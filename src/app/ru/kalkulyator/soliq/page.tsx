import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { MarketplaceTaxCalculator } from "@/features/calculators/marketplace-tax-calculator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Налоговый Калькулятор Маркетплейсов (ИП / ООО)",
  description:
    "Расчет налогов для селлеров маркетплейсов в Узбекистане: 4% с оборота, социальный налог ИП, порог НДС 1 млрд сумов и льготы e-commerce.",
  path: "/ru/kalkulyator/soliq",
  keywords: [
    "налоги маркетплейс узбекистан",
    "налог с оборота 4 процента uzum",
    "налоги ип uzum market",
    "порог ндс 1 млрд сумов узбекистан",
    "налоговый калькулятор селлера uzum",
    "социальный налог ип брв",
  ],
  ogTitle: "Налоговый Калькулятор Маркетплейсов Узбекистан — eStats",
  ogDescription: "Рассчитайте налог с оборота, социальный налог и риск НДС 12% при торговле на маркетплейсах.",
});

const FAQ_ITEMS = [
  {
    question: "Какие налоги платят продавцы на Uzum Market в Узбекистане?",
    answer:
      "Большинство селлеров работают как ИП (ЯТТ) или ООО (МЧЖ) на налоге с оборота по ставке 4% (или льготной 1-2% при подтверждении электронной коммерции). ИП также ежемесячно уплачивает социальный налог в размере 1 БРВ.",
  },
  {
    question: "С какой суммы рассчитывается налог: с чека или после комиссии?",
    answer:
      "По Налоговому кодексу РУз налог с оборота рассчитывается со всей суммы продажи покупателю (по фискальному чеку). Комиссия маркетплейса не уменьшает налогооблагаемую базу при налоге с оборота.",
  },
  {
    question: "Когда возникает обязательство по уплате НДС 12%?",
    answer:
      "При превышении совокупного оборота в 1 миллиард сумов за последние 12 месяцев бизнес автоматически переходит на общеустановленную систему с уплатой НДС 12% и налога на прибыль.",
  },
];

export default function RuTaxCalculatorPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Налоговый калькулятор", url: "/ru/kalkulyator/soliq" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <MarketplaceTaxCalculator locale="ru" />
    </article>
  );
}
