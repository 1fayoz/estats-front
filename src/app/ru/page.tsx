import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  DollarSign,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "eStats — Аналитика и Управление Продажами на Uzum Market, Wildberries, Yandex Market и Ozon",
  description:
    "Единая экосистема для селлеров маркетплейсов в Узбекистане. Точная себестоимость по FIFO, учет чистой прибыли PnL, остатки на складах FBO/FBS, AI оптимизация карточек и аналитика ниш.",
  keywords: [
    "аналитика uzum market",
    "аналитика маркетплейсов узбекистан",
    "калькулятор uzum market",
    "программа для склада узбекистан",
    "учет товаров маркетплейс",
    "аналог zoomselling",
    "1с для узбекских маркетплейсов",
    "wildberries узбекистан аналитика",
    "яндекс маркет узбекистан",
    "ozon узбекистан селлер",
    "себестоимость fifo узбекистан",
    "юнит экономика маркетплейс",
  ],
  alternates: {
    canonical: "/ru",
    languages: {
      uz: "/",
      ru: "/ru",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "eStats — Аналитика и Управление Продажами на Маркетплейсах",
    description:
      "Управляйте продажами на Uzum, Wildberries, Yandex Market и Ozon в едином окне. Точная чистая прибыль и складской учет.",
    url: "https://estats.uz/ru",
    locale: "ru_RU",
    type: "website",
  },
};

const FAQ_ITEMS = [
  {
    q: "Чем eStats отличается от ZoomSelling и других сервисов?",
    a: "eStats — это не просто парсер или сборщик статистики. Это комплексная ERP-система для селлера: точный расчет себестоимости по партионному методу FIFO, учет комиссий возвратов и логистики, контроль FBO/FBS складов и интеграция сразу с 4 маркетплейсами (Uzum, WB, Yandex, Ozon).",
  },
  {
    q: "Поддерживает ли сервис расчет комиссий и тарифов Uzum Market?",
    a: "Да, система автоматически обновляет актуальные ставки комиссий Uzum по всем категориям товаров, учитывает логистику FBO, комиссию за эквайринг и стоимость вывода средств.",
  },
  {
    q: "Заменяет ли eStats программу 1С или МойСклад?",
    a: "Да, для большинства селлеров eStats полностью заменяет громоздкие и дорогие учетные системы. eStats работает в облаке прямо из браузера или смартфона, не требует сложной настройки программистами и сразу адаптирован под специфику торговли на маркетплейсах.",
  },
  {
    q: "Есть ли бесплатные инструменты для начинающих продавцов?",
    a: "Да, на платформе доступны бесплатный калькулятор комиссии Uzum Market, калькулятор юнит-экономики и онлайн-сканер товаров по ссылке без обязательной регистрации.",
  },
];

export default function RussianHomePage() {
  return (
    <div className="space-y-20 py-8 sm:py-16">
      <FAQSchema
        items={FAQ_ITEMS.map((item) => ({
          question: item.q,
          answer: item.a,
        }))}
      />

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-5 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          <span>Платформа №1 для маркетплейсов в Узбекистане</span>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground leading-[1.15]">
          Управляйте продажами на{" "}
          <span className="text-primary">Uzum, Wildberries, Yandex и Ozon</span> в одной системе
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl">
          Автоматический расчет реальной чистой прибыли (FIFO), контроль остатков на складах FBO/FBS,
          AI оптимизация карточек и аналитика конкурентов без рутины в Excel.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            <span>Попробовать бесплатно</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/ru/tekshirish"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            <Search className="size-4 text-primary" />
            <span>Проверить товар по ссылке</span>
          </Link>
        </div>

        {/* Quick stats / trust */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 pt-8 border-t border-border/60">
          <div>
            <div className="text-2xl font-black text-foreground sm:text-3xl">4+</div>
            <div className="text-xs text-muted-foreground mt-1">Маркетплейса в одной панели</div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground sm:text-3xl">FIFO</div>
            <div className="text-xs text-muted-foreground mt-1">Точный партионный учет прибыли</div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground sm:text-3xl">AI 2.0</div>
            <div className="text-xs text-muted-foreground mt-1">Генерация SEO описаний и тегов</div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground sm:text-3xl">4.9 ★</div>
            <div className="text-xs text-muted-foreground mt-1">Рейтинг доверия селлеров</div>
          </div>
        </div>
      </section>

      {/* Free Interactive Tools Hub */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Бесплатные инструменты
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Экспресс-расчеты для продавцов и инвесторов
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Используйте наши профессиональные калькуляторы для точного планирования маржинальности до закупа партии.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link
              href="/ru/tekshirish"
              className="group rounded-2xl border border-border/80 bg-background/60 p-5 transition hover:border-primary/50 hover:bg-card hover:shadow-md"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Search className="size-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition flex items-center justify-between">
                <span>Сканер товаров Uzum</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Введите ссылку или артикул для оценки выручки, заказов и аудита карточки.
              </p>
            </Link>

            <Link
              href="/ru/kalkulyator/uzum-komissiya"
              className="group rounded-2xl border border-border/80 bg-background/60 p-5 transition hover:border-primary/50 hover:bg-card hover:shadow-md"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <DollarSign className="size-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition flex items-center justify-between">
                <span>Калькулятор Uzum</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Расчет комиссии маркетплейса, стоимости логистики FBO и чистой прибыли.
              </p>
            </Link>

            <Link
              href="/ru/kalkulyator/unit-iqtisodiyot"
              className="group rounded-2xl border border-border/80 bg-background/60 p-5 transition hover:border-primary/50 hover:bg-card hover:shadow-md"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <BarChart3 className="size-5" />
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition flex items-center justify-between">
                <span>Юнит-экономика</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Анализ точки безубыточности, ROI, рентабельности и маржи на 1 единицу.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplaces Showcase */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="text-center sm:text-left mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Мульти-маркетплейс</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Подключение всех популярных площадок
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Продавайте сразу на нескольких площадках и синхронизируйте складские остатки в одном месте.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Link
            href="/ru/bozorlar/wildberries"
            className="rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg group"
          >
            <div className="inline-block rounded-xl bg-purple-500/10 text-purple-600 px-3 py-1 text-xs font-bold">
              Wildberries
            </div>
            <h3 className="mt-4 text-lg font-bold group-hover:text-primary transition">
              Wildberries Узбекистан
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Аналитика заказов, контроль выкупов, учет поставок по схеме FBS и FBO для селлеров из Узбекистана.
            </p>
          </Link>

          <Link
            href="/ru/bozorlar/yandex-market"
            className="rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg group"
          >
            <div className="inline-block rounded-xl bg-yellow-500/10 text-yellow-600 px-3 py-1 text-xs font-bold">
              Яндекс Маркет
            </div>
            <h3 className="mt-4 text-lg font-bold group-hover:text-primary transition">
              Яндекс Маркет Узбекистан
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Управление заказами по модели Экспресс и FBS, аналитика рекламных кампаний и ставок.
            </p>
          </Link>

          <Link
            href="/ru/bozorlar/ozon"
            className="rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg group"
          >
            <div className="inline-block rounded-xl bg-blue-500/10 text-blue-600 px-3 py-1 text-xs font-bold">
              Ozon
            </div>
            <h3 className="mt-4 text-lg font-bold group-hover:text-primary transition">
              Ozon Узбекистан
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Экспортные продажи в СНГ, расчет трансграничной логистики и контроль остатков.
            </p>
          </Link>
        </div>
      </section>

      {/* Competitors & Why eStats */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Сравнение</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Почему селлеры переходят на eStats?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Устали от сложных таблиц Excel, зависающей 1С и ограниченного функционала старых парсеров?
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              href="/ru/muqobil/zoomselling"
              className="rounded-2xl border border-border bg-background p-6 transition hover:border-primary"
            >
              <h3 className="font-bold text-foreground flex items-center justify-between">
                <span>eStats против ZoomSelling</span>
                <ArrowRight className="size-4 text-primary" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                В отличие от ZoomSelling, мы рассчитываем реальную себестоимость каждой партии по FIFO,
                поддерживаем мульти-маркетплейс и отправляем мгновенные Telegram-уведомления.
              </p>
            </Link>

            <Link
              href="/ru/muqobil/1c"
              className="rounded-2xl border border-border bg-background p-6 transition hover:border-primary"
            >
              <h3 className="font-bold text-foreground flex items-center justify-between">
                <span>eStats вместо 1С и МойСклад</span>
                <ArrowRight className="size-4 text-primary" />
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Никаких сложных настроек, программистов и тяжелых серверов. Готовая облачная система учета,
                адаптированная специально под маркетплейсы Узбекистана.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="text-center sm:text-left mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Частые вопросы</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Ответы на популярные вопросы о сервисе
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>{item.q}</span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed pl-6">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-14 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Начните управлять прибылью уже сегодня
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base opacity-90 leading-relaxed">
            Подключите ваши магазины к eStats и получите полный контроль над продажами, остатками и финансами.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
            >
              <span>Зарегистрироваться в eStats</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
