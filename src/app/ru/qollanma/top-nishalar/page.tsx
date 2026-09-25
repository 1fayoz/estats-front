import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, TrendingUp, CheckCircle2 } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Как найти прибыльную нишу на Uzum Market в 2026 году | eStats",
  description:
    "Методика поиска свободных ниш с низкой конкуренцией и высоким спросом на Uzum Market: анализ объемов продаж, проверка монополизации и расчет юнит-экономики.",
  keywords: [
    "прибыльные ниши uzum market",
    "что продавать на uzum 2026",
    "поиск ниши маркетплейс узбекистан",
    "аналитика конкурентов uzum",
    "товары с высоким спросом узбекистан",
  ],
  alternates: {
    canonical: "/ru/qollanma/top-nishalar",
    languages: {
      uz: "/qollanma/top-nishalar",
      ru: "/ru/qollanma/top-nishalar",
    },
  },
  openGraph: {
    title: "Как найти прибыльную нишу на Uzum Market — eStats",
    description: "Формула выбора товара с гарантированным спросом и маржой от 30%.",
    url: "https://estats.uz/ru/qollanma/top-nishalar",
  },
};

const CRITERIA = [
  {
    title: "Объем выручки в категории от 500 млн сум/месяц",
    text: "Категория должна иметь сформированный спрос. Если весь объем рынка составляет менее 100 млн сум, заработать миллионные прибыли будет трудно даже на 1-м месте.",
  },
  {
    title: "Доля топ-1 селлера не более 35%",
    text: "Если один монопольный магазин забирает более половины всей выручки, конкурировать по цене будет тяжело. Ищите ниши с равномерным распределением заказов.",
  },
  {
    title: "Упущенная выручка (Out of Stock у конкурентов)",
    text: "Если карточки из первой десятки регулярно сидят с нулевыми остатками, покупатели вынуждены искать альтернативы — это идеальная точка входа для новой партии.",
  },
  {
    title: "Маржинальность после всех комиссий не менее 30%",
    text: "С учетом логистики, комиссии Uzum и расходов на упаковку товар должен обеспечивать подушку безопасности минимум в 30% чистой маржи.",
  },
];

export default function RussianTopNichesGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Инструкции", url: "/ru/qollanma" },
          { name: "Поиск ниши", url: "/ru/qollanma/top-nishalar" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="size-3.5" /> Анализ Рынков
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Как найти прибыльную нишу на <span className="text-primary">Uzum Market</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Пошаговый алгоритм выбора товара для закупа в Китае или производства в Узбекистане без риска слить капитал.
        </p>
      </header>

      <section className="space-y-6">
        {CRITERIA.map((criterion, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>{criterion.title}</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed pl-7">
              {criterion.text}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Используйте сканер ниш eStats</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Модуль «Рынок» в eStats автоматически находит растущие товары и рассчитывает объем выручки за последние 30 дней.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
          >
            <span>Начать бесплатно</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
