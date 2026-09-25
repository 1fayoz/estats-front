import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Как правильно оформить карточку товара на Uzum Market для ТОПа | eStats",
  description:
    "Секреты SEO оптимизации карточки товара на Uzum Market: составление ключевых заголовков, продающее описание, инфографика и повышение конверсии кликов в заказы.",
  keywords: [
    "seo оптимизация карточки uzum",
    "как заполнить карточку на узбекистан маркет",
    "наименование товара uzum market",
    "инфографика для uzum",
    "продвижение карточки в топ uzum",
  ],
  alternates: {
    canonical: "/ru/qollanma/kartochka-toldirish",
    languages: {
      uz: "/qollanma/kartochka-toldirish",
      ru: "/ru/qollanma/kartochka-toldirish",
    },
  },
  openGraph: {
    title: "Оформление карточки товара на Uzum Market для выхода в ТОП — eStats",
    description: "Пошаговые правила SEO и дизайна карточки товара.",
    url: "https://estats.uz/ru/qollanma/kartochka-toldirish",
  },
};

const RULES = [
  {
    title: "Правильная структура заголовка (SEO Title)",
    text: "Формула успешного названия: [Тип товара] + [Бренд/Модель] + [Ключевые свойства/Материал] + [Назначение]. Например: «Футболка мужская оверсайз хлопок базовая летняя». Избегайте спама и повторяющихся слов.",
  },
  {
    title: "Продающая инфографика на первом слайде",
    text: "Главная фотография решает 80% успеха кликабельности (CTR). Выносите на первый слайд только 3-4 главных преимущества (например: «100% натуральный хлопок», «Не садится при стирке»).",
  },
  {
    title: "Подробные характеристики и атрибуты",
    text: "Покупатели на Uzum Market активно пользуются фильтрами. Обязательно заполняйте все доступные поля: цвет, состав, страна производства, габариты и гарантийный срок.",
  },
  {
    title: "Описание с ключевыми запросами (LSI)",
    text: "Текст должен легко читаться и отвечать на частые вопросы покупателя. Используйте модуль eStats AI SEO для мгновенной генерации текстов на узбекском и русском языках.",
  },
];

export default function RussianCardSeoGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Инструкции", url: "/ru/qollanma" },
          { name: "SEO Карточки товара", url: "/ru/qollanma/kartochka-toldirish" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> SEO Оптимизация
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Как оформить карточку товара на <span className="text-primary">Uzum Market</span> для ТОПа
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Практические рекомендации по повышению позиций карточки во внутреннем поиске и увеличению конверсии (CR).
        </p>
      </header>

      <section className="space-y-6">
        {RULES.map((rule, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary shrink-0" />
              <span>{rule.title}</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed pl-7">
              {rule.text}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Создавайте ТОП-карточки за 10 секунд с AI</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Модуль eStats AI SEO автоматически подбирает популярные ключевые слова и генерирует описания на узбекском и русском языках.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
          >
            <span>Попробовать AI Генератор</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
