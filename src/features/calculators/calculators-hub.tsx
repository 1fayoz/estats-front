"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  Truck,
  FileText,
  Barcode,
  Package,
  Landmark,
  Percent,
  TrendingUp,
  Tag,
  AlertOctagon,
  BarChart3,
  Image as ImageIcon,
  Flame,
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export type HubLocale = "uz" | "ru" | "en";

interface ToolItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  category: "warehouse" | "finance" | "analytics";
  href: string;
  icon: React.ElementType;
  popular?: boolean;
}

const TOOLS: Record<HubLocale, ToolItem[]> = {
  uz: [
    // Warehouse & Logistics
    {
      id: "kargo",
      title: "Xitoy (1688 / Kargo) Tan Narxi",
      description: "Yuan kursi, kargo ($/kg), qadoq va Toshkentgacha 1 dona tovarning to'liq tan narxi.",
      badge: "Yangi • Top",
      category: "warehouse",
      href: "/kalkulyator/kargo",
      icon: Truck,
      popular: true,
    },
    {
      id: "fbo-akt",
      title: "FBO / FBS Tovar Topshirish Akti",
      description: "Uzum va Wildberries omboriga yuk topshirish nakladnoyasi va A4 hujjatini tayyorlash.",
      badge: "Chop etish A4",
      category: "warehouse",
      href: "/kalkulyator/fbo-akt",
      icon: FileText,
      popular: true,
    },
    {
      id: "shtrix-kod",
      title: "Shtrix-kod & Termo-etiketka 58x40",
      description: "Code-128 va EAN-13 termo-stikerlarni onlayn generatsiya va printerga chop etish.",
      badge: "58x40 mm",
      category: "warehouse",
      href: "/kalkulyator/shtrix-kod",
      icon: Barcode,
      popular: true,
    },
    {
      id: "ombor-zaxirasi",
      title: "Ombor Zaxirasini Rejalashtirish (ROP)",
      description: "Tovar tugab qolmasligi (Out of Stock bo'lmasligi) uchun xavfsiz zaxira va buyurtma vaqti.",
      badge: "Reorder Point",
      category: "warehouse",
      href: "/kalkulyator/ombor-zaxirasi",
      icon: Package,
    },

    // Finance & Taxes
    {
      id: "soliq",
      title: "Marketpleys Soliq Kalkulyatori",
      description: "YaTT 4% aylanma soliq, elektron tijorat imtiyozi va 1 mlrd so'mlik QQS chegarasi hisobi.",
      badge: "2026 Soliq",
      category: "finance",
      href: "/kalkulyator/soliq",
      icon: Landmark,
      popular: true,
    },
    {
      id: "uzum-komissiya",
      title: "Uzum Komissiya Kalkulyatori",
      description: "Barcha toifalar bo'yicha komissiya, logistika xarajati va cho'ntakda qoladigan sof foyda.",
      badge: "Rasmiy tariflar",
      category: "finance",
      href: "/kalkulyator/uzum-komissiya",
      icon: Percent,
      popular: true,
    },
    {
      id: "unit-iqtisodiyot",
      title: "Unit Iqtisodiyoti Kalkulyatori",
      description: "1 dona tovar bo'yicha sof marja %, ROI % va zararsizlik narxini (Break-even) hisoblash.",
      badge: "Marja & ROI",
      category: "finance",
      href: "/kalkulyator/unit-iqtisodiyot",
      icon: TrendingUp,
      popular: true,
    },
    {
      id: "chegirma-narx",
      title: "Chegirma va Narx Qo'yish",
      description: "Aksiyalarda ham kutilgan sof marjada qolish uchun chizilgan narx va sotuv narxi hisobi.",
      badge: "Aksiya narxlari",
      category: "finance",
      href: "/kalkulyator/chegirma-narx",
      icon: Tag,
    },
    {
      id: "vozvrat-zarari",
      title: "Vozvrat va Zararlar Kalkulyatori",
      description: "Xaridorlar qaytargan tovarlar sababli yashirin logistika va qadoq zararlarini aniqlash.",
      badge: "Zararni hisoblash",
      category: "finance",
      href: "/kalkulyator/vozvrat-zarari",
      icon: AlertOctagon,
    },

    // Market & Quality
    {
      id: "abc-tahlil",
      title: "ABC / XYZ Tovar Tahlili",
      description: "Pareto 80/20 qoidasi bo'yicha 80% daromad keltiruvchi lokomotivlar va o'lik zaxirani aniqlash.",
      badge: "Pareto 80/20",
      category: "analytics",
      href: "/kalkulyator/abc-tahlil",
      icon: BarChart3,
      popular: true,
    },
    {
      id: "rasm-talablari",
      title: "Foto va Infografika O'lchamlari",
      description: "Uzum va Wildberries 3:4 proporsiyasi (1200x1600 px) va moderatsiya talablarini tekshirish.",
      badge: "3:4 Proporsiya",
      category: "analytics",
      href: "/kalkulyator/rasm-talablari",
      icon: ImageIcon,
    },
    {
      id: "drr",
      title: "DRR va Reklama Rentabelligi",
      description: "Boost TOP reklama xarajatlarining rentabelligi, klik narxi va ROAS ko'rsatkichi.",
      badge: "Boost TOP & ROAS",
      category: "analytics",
      href: "/kalkulyator/drr",
      icon: Flame,
    },
    {
      id: "tekshirish",
      title: "Uzum Tovar Skaneri va Auditi",
      description: "Istalgan Uzum tovar linki yoki ID orqali oylik sotuv, daromad va AI SEO auditini darhol bilish.",
      badge: "Onlayn Skaner",
      category: "analytics",
      href: "/tekshirish",
      icon: Search,
      popular: true,
    },
  ],
  ru: [
    // Warehouse & Logistics
    {
      id: "kargo-ru",
      title: "Себестоимость и Карго из Китая",
      description: "Курс юаня, тариф карго за кг, страховка, упаковка и себестоимость в Ташкенте.",
      badge: "Новинка • Топ",
      category: "warehouse",
      href: "/ru/kalkulyator/kargo",
      icon: Truck,
      popular: true,
    },
    {
      id: "fbo-akt-ru",
      title: "Акт приёма-передачи FBO / FBS",
      description: "Создание товарной накладной и реестра сдачи на склад маркетплейса в формате А4.",
      badge: "Печать А4",
      category: "warehouse",
      href: "/ru/kalkulyator/fbo-akt",
      icon: FileText,
      popular: true,
    },
    {
      id: "shtrix-kod-ru",
      title: "Генератор штрихкодов 58х40",
      description: "Генератор кодов Code-128 и EAN-13 под термопринтеры Xprinter, TSC и Zebra.",
      badge: "58х40 мм",
      category: "warehouse",
      href: "/ru/kalkulyator/shtrix-kod",
      icon: Barcode,
      popular: true,
    },
    {
      id: "ombor-zaxirasi-ru",
      title: "Расчет точки перезаказа (ROP)",
      description: "Предотвращение обнуления остатков (Out of Stock) и расчет страхового запаса.",
      badge: "Reorder Point",
      category: "warehouse",
      href: "/ru/kalkulyator/ombor-zaxirasi",
      icon: Package,
    },

    // Finance & Taxes
    {
      id: "soliq-ru",
      title: "Налоговый калькулятор маркетплейсов",
      description: "Расчет налога 4% с оборота, социального налога ИП и мониторинг порога НДС 1 млрд.",
      badge: "Налоги 2026",
      category: "finance",
      href: "/ru/kalkulyator/soliq",
      icon: Landmark,
      popular: true,
    },
    {
      id: "uzum-komissiya-ru",
      title: "Калькулятор комиссии Uzum Market",
      description: "Комиссия категорий, тарифы на логистику и чистая прибыль продавца с единицы.",
      badge: "Тарифы 2026",
      category: "finance",
      href: "/ru/kalkulyator/uzum-komissiya",
      icon: Percent,
      popular: true,
    },
    {
      id: "unit-iqtisodiyot-ru",
      title: "Калькулятор юнит-экономики",
      description: "Расчет чистой маржи, ROI % и точки безубыточности (Break-even) на 1 товар.",
      badge: "Маржа и ROI",
      category: "finance",
      href: "/ru/kalkulyator/unit-iqtisodiyot",
      icon: TrendingUp,
      popular: true,
    },
    {
      id: "chegirma-narx-ru",
      title: "Калькулятор скидок и наценки",
      description: "Установка зачеркнутой цены и распродаж без ухода в кассовый разрыв.",
      badge: "Ценообразование",
      category: "finance",
      href: "/ru/kalkulyator/chegirma-narx",
      icon: Tag,
    },
    {
      id: "vozvrat-zarari-ru",
      title: "Калькулятор убытков от возвратов",
      description: "Точный расчет скрытых потерь на обратной логистике, браке и повреждениях.",
      badge: "Убытки невыкупа",
      category: "finance",
      href: "/ru/kalkulyator/vozvrat-zarari",
      icon: AlertOctagon,
    },

    // Market & Analytics
    {
      id: "abc-tahlil-ru",
      title: "ABC-Анализ товарной матрицы",
      description: "Сегментация по правилу Парето: локомотивы (80% выручки), стабильные и неликвид.",
      badge: "Парето 80/20",
      category: "analytics",
      href: "/ru/kalkulyator/abc-tahlil",
      icon: BarChart3,
      popular: true,
    },
    {
      id: "rasm-talablari-ru",
      title: "Проверка фото и инфографики",
      description: "Пропорция 3:4 (1200х1600 px) и 5 строгих правил модерации карточек Uzum.",
      badge: "Пропорция 3:4",
      category: "analytics",
      href: "/ru/kalkulyator/rasm-talablari",
      icon: ImageIcon,
    },
    {
      id: "drr-ru",
      title: "Калькулятор ДРР и рекламы",
      description: "Окупаемость продвижения Boost TOP, цена клика и расчет показателя ROAS.",
      badge: "Boost TOP и ROAS",
      category: "analytics",
      href: "/ru/kalkulyator/drr",
      icon: Flame,
    },
    {
      id: "tekshirish-ru",
      title: "Сканер товаров Uzum по ссылке",
      description: "Моментальный аудит продаж, выручки и остатков любого товара на Uzum Market.",
      badge: "Онлайн сканер",
      category: "analytics",
      href: "/ru/tekshirish",
      icon: Search,
      popular: true,
    },
  ],
  en: [
    // Warehouse & Logistics
    {
      id: "barcode-en",
      title: "Barcode & Thermal Label Generator",
      description: "Generate Code-128 and EAN-13 barcodes and print standard 58x40 mm thermal labels.",
      badge: "58x40 mm",
      category: "warehouse",
      href: "/en/tools/barcode-generator",
      icon: Barcode,
      popular: true,
    },
    {
      id: "abc-en",
      title: "Inventory ABC Analysis Calculator",
      description: "Pareto 80/20 inventory matrix categorization to identify revenue drivers and dead stock.",
      badge: "Pareto 80/20",
      category: "analytics",
      href: "/en/tools/abc-analysis",
      icon: BarChart3,
      popular: true,
    },
    {
      id: "check-en",
      title: "Marketplace Product & Revenue Scanner",
      description: "Instant analytics, monthly revenue, order volume, and SEO audit by product URL.",
      badge: "Live Scanner",
      category: "analytics",
      href: "/en/tools/product-checker",
      icon: Search,
      popular: true,
    },
    {
      id: "comm-en",
      title: "Marketplace Commission Calculator",
      description: "Calculate platform fees, fulfillment costs, and net seller margin per product unit.",
      badge: "Fees & Margin",
      category: "finance",
      href: "/en/tools/commission-calculator",
      icon: Percent,
      popular: true,
    },
    {
      id: "unit-en",
      title: "Unit Economics & Break-Even Tool",
      description: "Determine per-unit contribution margins, return on investment, and break-even pricing.",
      badge: "ROI & Margin",
      category: "finance",
      href: "/kalkulyator/unit-iqtisodiyot",
      icon: TrendingUp,
    },
    {
      id: "drr-en",
      title: "Advertising ROAS & ACoS Calculator",
      description: "Measure promotional ad efficiency, cost-per-click, and return on ad spend.",
      badge: "ROAS & ACoS",
      category: "analytics",
      href: "/kalkulyator/drr",
      icon: Flame,
    },
  ],
};

const UI_TEXTS = {
  uz: {
    title: "Marketpleyslar Uchun Bepul Onlayn Kalkulyatorlar",
    subtitle:
      "Uzum Market, Wildberries va Ozon sotuvchilari uchun 12+ ta professional vosita: tan narx, komissiya, soliq, ombor aktlari va ABC tahlili — ro'yxatdan o'tmasdan bepul foydalaning.",
    searchPlaceholder: "Kalkulyator yoki vositani qidiring...",
    allTab: "Barcha vositalar (13)",
    warehouseTab: "📦 Ombor va Logistika",
    financeTab: "💰 Moliya va Soliqlar",
    analyticsTab: "📈 Bozor va Sifat",
    tryButton: "Foydalanish",
    ratingText: "⭐ 4.9 (1,400+ sotuvchi tavsiya qilgan)",
    faqTitle: "Kalkulyatorlar bo'yicha ko'p beriladigan savollar",
  },
  ru: {
    title: "Бесплатные Онлайн Калькуляторы для Маркетплейсов",
    subtitle:
      "12+ профессиональных инструментов для селлеров Uzum Market, Wildberries и Ozon: расчет себестоимости, налогов, комиссий, штрихкодов и ABC-анализа без регистрации.",
    searchPlaceholder: "Поиск калькулятора или инструмента...",
    allTab: "Все инструменты (13)",
    warehouseTab: "📦 Склад и Логистика",
    financeTab: "💰 Финансы и Налоги",
    analyticsTab: "📈 Рынок и Аналитика",
    tryButton: "Открыть",
    ratingText: "⭐ 4.9 (Более 1,400 проверенных отзывов)",
    faqTitle: "Часто задаваемые вопросы по калькуляторам",
  },
  en: {
    title: "Free E-Commerce & Marketplace Calculators",
    subtitle:
      "A complete suite of free operational tools for marketplace sellers across Central Asia: barcode generators, unit economics, ABC analysis, and commission calculators.",
    searchPlaceholder: "Search calculator or tool...",
    allTab: "All Tools",
    warehouseTab: "📦 Warehouse & WMS",
    financeTab: "💰 Finance & Unit Economics",
    analyticsTab: "📈 Market & Intelligence",
    tryButton: "Launch Tool",
    ratingText: "⭐ 4.9 (Trusted by 1,400+ sellers)",
    faqTitle: "Frequently Asked Questions",
  },
};

export function CalculatorsHub({ locale = "uz" }: { locale?: HubLocale }) {
  const t = UI_TEXTS[locale] || UI_TEXTS.uz;
  const toolsList = TOOLS[locale] || TOOLS.uz;

  const [activeTab, setActiveTab] = useState<"all" | "warehouse" | "finance" | "analytics">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    return toolsList.filter((item) => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [toolsList, activeTab, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-4 h-4" />
          <span>{t.ratingText}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {t.subtitle}
        </p>

        {/* Search Bar */}
        <div className="pt-2 max-w-md mx-auto relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-input bg-card text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.allTab}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("warehouse")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "warehouse"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.warehouseTab}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("finance")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "finance"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.financeTab}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "analytics"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.analyticsTab}
        </button>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group bg-card hover:bg-muted/40 border border-border hover:border-primary/40 rounded-2xl p-6 transition shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground group-hover:text-foreground transition">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition flex items-center gap-1.5">
                  <span>{tool.title}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                <span>{t.tryButton}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-7 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-foreground">
              Barcha kalkulyatorlar 100% bepul va cheklovlarsiz
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              Hech qanday ro'yxatdan o'tish yoki to'lov talab qilinmaydi. Hisob-kitoblar brauzeringizda xavfsiz amalga oshiriladi.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition shadow-md text-xs whitespace-nowrap"
        >
          <span>eStats To'liq Tizimiga Kirish</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
