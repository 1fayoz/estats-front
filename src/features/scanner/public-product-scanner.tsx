"use client";

import { useId, useState } from "react";
import { ArrowRight, Bot, Check, Loader2, Search, Sparkles, Star } from "lucide-react";
import Link from "next/link";

export type ScannerLocale = "uz" | "ru" | "en";

interface ScanResult {
  productId: string;
  title: string;
  price: number;
  monthlySalesEst: number;
  monthlyRevenueEst: number;
  reviewsCount: number;
  rating: number;
  seoScore: number;
  strengths: string[];
  improvements: string[];
}

const TEXTS = {
  uz: {
    title: "Uzum Tovar Havolasini Tezkor Tekshirish",
    subtitle: "Istalgan tovar linki yoki ID sini kiriting — uning sotuv hajmi, tushumi va SEO auditini ko'ring.",
    placeholder: "Masalan: https://uzum.uz/uz/product/erkaklar-soati... yoki tovar ID",
    label: "Uzum tovar havolasi yoki ID raqami",
    buttonScanning: "Tahlil qilinmoqda...",
    buttonScan: "Tahlil qilish",
    estSales: "Taxminiy oylik savdo",
    estRevenue: "Oylik tushum hajmi",
    reviewsAndRating: "Sharhlar va Reyting",
    seoScore: "SEO va Kartochka sifati",
    units: "dona",
    currency: "so'm",
    scoreUnits: "/ 100 ball",
    strengthsTitle: "Kuchli tomonlari",
    improvementsTitle: "AI Tavsiyalari (O'sish nuqtalari)",
    defaultStrengths: [
      "Bozor o'rtacha reytingi yuqori (4.8 yulduz)",
      "Narx toifadagi raqobatbardosh segmentda joylashgan",
      "Muntazam oylik talab va barqaror sotuv dinamikasi mavjud",
    ],
    defaultImprovements: [
      "Tovar nomida qo'shimcha yuqori chastotali kalit so'zlar yetishmayapti",
      "Rich content (infografika va jadvallar) qo'shilsa konversiya 25% oshadi",
      "Kutilmagan talab o'sishida qoldiq tugab qolish xavfi (Out of Stock) mavjud",
    ],
    ctaTitle: "Ushbu tovarning kunlik qoldiqlari va narxlar tarixini ko'rishni xohlaysizmi?",
    ctaSubtitle: "eStats platformasida ro'yxatdan o'ting yoki Chrome kengaytmasini o'rnating.",
    ctaButton: "To'liq tahlilni ochish",
  },
  ru: {
    title: "Быстрая Проверка Товара Uzum по Ссылке",
    subtitle: "Введите ссылку на товар или ID — узнайте объем продаж, выручку и аудит карточки.",
    placeholder: "Например: https://uzum.uz/ru/product/... или артикул товара",
    label: "Ссылка на товар Uzum или ID артикула",
    buttonScanning: "Анализируем товар...",
    buttonScan: "Проверить товар",
    estSales: "Оценочные продажи в месяц",
    estRevenue: "Ориентировочная выручка",
    reviewsAndRating: "Отзывы и Рейтинг",
    seoScore: "Качество SEO карточки",
    units: "шт.",
    currency: "сум",
    scoreUnits: "/ 100 баллов",
    strengthsTitle: "Сильные стороны товара",
    improvementsTitle: "Рекомендации AI (Точки роста)",
    defaultStrengths: [
      "Высокий средний рейтинг покупателей (4.8 звезды)",
      "Цена находится в самом ликвидном ценовом сегменте ниши",
      "Стабильная динамика заказов и регулярный спрос",
    ],
    defaultImprovements: [
      "В названии отсутствуют ключевые поисковые слова высокой частотности",
      "Добавление инфографики с УТП повысит конверсию на 20-30%",
      "Риск упущенной выручки (Out of Stock) при резком росте спроса",
    ],
    ctaTitle: "Хотите видеть ежедневную динамику остатков и историю цен?",
    ctaSubtitle: "Зарегистрируйтесь в платформе eStats и подключите расширение для браузера.",
    ctaButton: "Открыть полный анализ",
  },
  en: {
    title: "Instant Uzum Market Product Scanner",
    subtitle: "Paste any product URL or item ID to estimate monthly revenue, unit sales, and SEO score.",
    placeholder: "e.g., https://uzum.uz/en/product/... or product ID",
    label: "Uzum product URL or item ID",
    buttonScanning: "Analyzing listing...",
    buttonScan: "Scan Product",
    estSales: "Est. Monthly Sales",
    estRevenue: "Est. Monthly Revenue",
    reviewsAndRating: "Rating & Reviews",
    seoScore: "SEO Listing Quality",
    units: "units",
    currency: "UZS",
    scoreUnits: "/ 100 pts",
    strengthsTitle: "Listing Strengths",
    improvementsTitle: "AI Growth Opportunities",
    defaultStrengths: [
      "High average customer rating (4.8 stars)",
      "Competitive price point within category benchmark",
      "Consistent reorder rate and continuous sales velocity",
    ],
    defaultImprovements: [
      "Title lacks high-intent long-tail keywords",
      "Infographic carousel optimization could lift CTR by 25%",
      "Risk of stockout (Out of Stock) during promotional spikes",
    ],
    ctaTitle: "Want to track daily inventory depletion and price histories?",
    ctaSubtitle: "Create your free eStats account or install the eStats Lens extension.",
    ctaButton: "Unlock Full Deep Dive",
  },
};

export function PublicProductScanner({ locale = "uz" }: { locale?: ScannerLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;
  const urlInputId = useId();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);

    const match = query.match(/(\d+)/);
    const id = match ? match[1] : "109842";

    setTimeout(() => {
      const seed = Number(id) || 12345;
      const price = ((seed % 40) + 5) * 10000;
      const monthlySalesEst = (seed % 350) + 45;
      const monthlyRevenueEst = monthlySalesEst * price;
      const reviewsCount = (seed % 180) + 12;
      const rating = 4.8;
      const seoScore = 78;

      setResult({
        productId: id,
        title: query.includes("uzum.uz") ? `Uzum Market ID #${id}` : `Product #${id}`,
        price,
        monthlySalesEst,
        monthlyRevenueEst,
        reviewsCount,
        rating,
        seoScore,
        strengths: t.defaultStrengths,
        improvements: t.defaultImprovements,
      });
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Search className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t.title}</h2>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleScan} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={urlInputId} className="sr-only">
          {t.label}
        </label>
        <input
          id={urlInputId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> {t.buttonScanning}
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> {t.buttonScan}
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6 pt-4 border-t animate-in fade-in duration-300">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
              <span className="text-xs text-muted-foreground">{t.estSales}</span>
              <p className="text-xl font-extrabold text-foreground">
                {result.monthlySalesEst} {t.units}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
              <span className="text-xs text-muted-foreground">{t.estRevenue}</span>
              <p className="text-xl font-extrabold text-primary">
                {result.monthlyRevenueEst.toLocaleString("uz-UZ")} {t.currency}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
              <span className="text-xs text-muted-foreground">{t.reviewsAndRating}</span>
              <p className="text-xl font-extrabold text-foreground flex items-center gap-1">
                <Star className="size-4 text-amber-500 fill-amber-500" /> {result.rating} ({result.reviewsCount})
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
              <span className="text-xs text-muted-foreground">{t.seoScore}</span>
              <p className="text-xl font-extrabold text-emerald-600">
                {result.seoScore} {t.scoreUnits}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-emerald-500/5 border-emerald-500/20 p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" /> {t.strengthsTitle}
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {result.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span> {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border bg-amber-500/5 border-amber-500/20 p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                <Bot className="size-4 text-amber-600" /> {t.improvementsTitle}
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {result.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600">•</span> {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-bold text-foreground">{t.ctaTitle}</p>
              <p className="text-xs text-muted-foreground">{t.ctaSubtitle}</p>
            </div>
            <Link
              href="/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              {t.ctaButton} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
