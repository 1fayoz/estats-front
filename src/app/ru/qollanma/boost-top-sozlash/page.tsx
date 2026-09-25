import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Megaphone, Target, CheckCircle2 } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Настройка рекламы Boost TOP на Uzum Market без слива бюджета | eStats",
  description:
    "Пошаговое руководство по внутренней рекламе на Uzum Market: выбор эффективных ставок, расчет допустимого ДРР (доли рекламных расходов) и анализ отдачи инвестиций (ROAS).",
  keywords: [
    "настройка boost top uzum",
    "реклама на узбекистан маркет",
    "как поднять товар в топ uzum",
    "дрр рекламы uzum market",
    "ставки рекламы маркетплейс",
  ],
  alternates: {
    canonical: "/ru/qollanma/boost-top-sozlash",
    languages: {
      uz: "/qollanma/boost-top-sozlash",
      ru: "/ru/qollanma/boost-top-sozlash",
    },
  },
  openGraph: {
    title: "Настройка рекламы Boost TOP на Uzum Market — eStats",
    description: "Как настроить рекламу в плюс и контролировать ДРР.",
    url: "https://estats.uz/ru/qollanma/boost-top-sozlash",
  },
};

const FAQ_ITEMS = [
  {
    question: "Какой максимальный ДРР можно устанавливать в Boost TOP?",
    answer:
      "ДРР не должен превышать маржинальность вашего товара. Если чистая маржа составляет 25%, то ДРР до 15% оставляет вам прибыль, а ДРР выше 25% уводит каждую продажу в минус.",
  },
];

export default function RussianBoostTopGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Инструкции", url: "/ru/qollanma" },
          { name: "Настройка Boost TOP", url: "/ru/qollanma/boost-top-sozlash" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Megaphone className="size-3.5" /> Внутренний Маркетинг
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Настройка рекламы <span className="text-primary">Boost TOP</span> на Uzum Market
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Как запускать рекламное продвижение карточек, управлять ставками за клик и гарантированно оставаться в плюсе.
        </p>
      </header>

      <section className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-foreground">1. Подготовка карточки перед запуском рекламы</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Никогда не запускайте платную рекламу на карточку без отзывов, качественной инфографики и заполненных характеристик. Реклама привлечет клики, но без социального доверия конверсия в покупку будет низкой, а бюджет сольется.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-foreground">2. Стратегия плавного повышения ставок</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Начинайте кампанию с минимально допустимых ставок. Наблюдайте за показами и кликами в течение 48 часов, постепенно увеличивая ставку на 5–10% до достижения желаемой позиции в блоке «Boost TOP».
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-foreground">3. Расчет ДРР через бесплатный калькулятор</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Используйте наш открытый <Link href="/ru/kalkulyator/drr" className="text-primary font-bold hover:underline">Калькулятор ДРР</Link> для еженедельной сверки фактических расходов со статистикой заказов.
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Автоматизируйте маркетинг с eStats</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Получайте уведомления об изменении ставок конкурентов и эффективности ваших рекламных вложений.
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
