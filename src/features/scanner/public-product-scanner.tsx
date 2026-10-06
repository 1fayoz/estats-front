"use client";

import { useId, useState } from "react";
import { ArrowRight, Check, Loader2, Search, Sparkles, Star, X } from "lucide-react";
import Link from "next/link";

import { API_BASE } from "@/lib/api";
import { formatNumber } from "@/lib/format";

export type ScannerLocale = "uz" | "ru" | "en";

/**
 * Landingdagi tovar tekshiruvi.
 *
 * Ilgari natija tovar ID'sidan hisoblab chiqarilardi (narx, sotuv, reyting,
 * "SEO 78" — hammasi uydirma). Endi faqat backend `/public/scan` beradigan
 * O'LCHANGAN faktlar: bozor xizmatining kunlik ma'lumoti va Uzum ochiq
 * katalogi. Bo'lmagan qiymat "—" (ADR-001).
 */
interface ScanResult {
  productId: number;
  title: string | null;
  photo: string | null;
  shop: string | null;
  category: string | null;
  price: number | null;
  units30: number | null;
  revenue30: number | null;
  rating: number | null;
  reviews: number | null;
  ordersTotal: number | null;
  photos: number | null;
  descriptionLength: number | null;
  checks: { ok: boolean; label: string; detail: string }[];
  marketTracked: boolean;
}

const TEXTS = {
  uz: {
    title: "Uzum tovarini tekshirish",
    subtitle: "Tovar havolasi yoki ID — o'lchangan sotuv, narx, sharhlar va kartochka holati.",
    placeholder: "Masalan: https://uzum.uz/uz/product/... yoki tovar ID",
    label: "Uzum tovar havolasi yoki ID raqami",
    buttonScanning: "Tekshirilmoqda...",
    buttonScan: "Tekshirish",
    sales30: "30 kunda sotildi",
    revenue30: "30 kunlik tushum",
    price: "Narx",
    reviews: "Reyting va sharhlar",
    ordersTotal: "Jami buyurtmalar (Uzum)",
    units: "dona",
    currency: "so'm",
    noData: "o'lchanmagan",
    notTracked: "Bu tovar bozor kuzatuvimizda hali yo'q — 30 kunlik sotuv o'lchanmagan.",
    checksTitle: "Kartochka tekshiruvi",
    source: "Manba: eStats bozor kuzatuvi (kunlik) va Uzum ochiq katalogi.",
    ctaTitle: "Kunlik qoldiq, narx tarixi va o'z foydangizni ko'rmoqchimisiz?",
    ctaSubtitle: "eStats'da ro'yxatdan o'ting yoki Chrome kengaytmasini o'rnating.",
    ctaButton: "To'liq tahlil",
    errors: { 404: "Bu tovar topilmadi.", 429: "Soatlik limit tugadi — birozdan keyin urinib ko'ring.", default: "Tekshirib bo'lmadi, keyinroq urinib ko'ring." },
  },
  ru: {
    title: "Проверка товара Uzum",
    subtitle: "Ссылка или ID товара — измеренные продажи, цена, отзывы и состояние карточки.",
    placeholder: "Например: https://uzum.uz/ru/product/... или ID товара",
    label: "Ссылка на товар Uzum или ID",
    buttonScanning: "Проверяем...",
    buttonScan: "Проверить",
    sales30: "Продано за 30 дней",
    revenue30: "Выручка за 30 дней",
    price: "Цена",
    reviews: "Рейтинг и отзывы",
    ordersTotal: "Всего заказов (Uzum)",
    units: "шт.",
    currency: "сум",
    noData: "не измерено",
    notTracked: "Товара пока нет в нашем мониторинге рынка — продажи за 30 дней не измерены.",
    checksTitle: "Проверка карточки",
    source: "Источник: ежедневный мониторинг рынка eStats и открытый каталог Uzum.",
    ctaTitle: "Хотите видеть остатки по дням, историю цен и свою прибыль?",
    ctaSubtitle: "Зарегистрируйтесь в eStats или установите расширение для Chrome.",
    ctaButton: "Полный анализ",
    errors: { 404: "Товар не найден.", 429: "Лимит на час исчерпан — попробуйте позже.", default: "Не удалось проверить, попробуйте позже." },
  },
  en: {
    title: "Uzum product check",
    subtitle: "Product URL or ID — measured sales, price, reviews and listing state.",
    placeholder: "e.g., https://uzum.uz/en/product/... or product ID",
    label: "Uzum product URL or ID",
    buttonScanning: "Checking...",
    buttonScan: "Check",
    sales30: "Sold in 30 days",
    revenue30: "30-day revenue",
    price: "Price",
    reviews: "Rating & reviews",
    ordersTotal: "Total orders (Uzum)",
    units: "units",
    currency: "UZS",
    noData: "not measured",
    notTracked: "This product is not in our market tracking yet — 30-day sales are not measured.",
    checksTitle: "Listing check",
    source: "Source: eStats daily market tracking and Uzum public catalog.",
    ctaTitle: "Want daily stock, price history and your own profit?",
    ctaSubtitle: "Create an eStats account or install the Chrome extension.",
    ctaButton: "Full analysis",
    errors: { 404: "Product not found.", 429: "Hourly limit reached — try again later.", default: "Couldn't check, try again later." },
  },
};

export function PublicProductScanner({ locale = "uz" }: { locale?: ScannerLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;
  const urlInputId = useId();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/public/scan?product=${encodeURIComponent(query.trim())}`);
      if (!res.ok) {
        const key = res.status as 404 | 429;
        setError(t.errors[key] ?? t.errors.default);
        return;
      }
      setResult((await res.json()) as ScanResult);
    } catch {
      setError(t.errors.default);
    } finally {
      setIsLoading(false);
    }
  };

  const money = (v: number | null) => (v == null ? t.noData : `${formatNumber(v)} ${t.currency}`);

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
        <label htmlFor={urlInputId} className="sr-only">{t.label}</label>
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
          {isLoading ? (<><Loader2 className="size-4 animate-spin" /> {t.buttonScanning}</>) : (<><Sparkles className="size-4" /> {t.buttonScan}</>)}
        </button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="space-y-6 pt-4 border-t animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            {result.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.photo} alt="" className="size-14 rounded-xl object-cover" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{result.title ?? `#${result.productId}`}</p>
              <p className="truncate text-xs text-muted-foreground">
                {[result.shop, result.category].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Tile label={t.sales30} value={result.units30 == null ? t.noData : `${formatNumber(result.units30)} ${t.units}`} />
            <Tile label={t.revenue30} value={money(result.revenue30)} accent />
            <Tile label={t.price} value={money(result.price)} />
            <Tile
              label={t.reviews}
              value={
                result.rating == null && result.reviews == null ? t.noData : (
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    {result.rating?.toFixed(1) ?? "—"} ({formatNumber(result.reviews ?? 0)})
                  </span>
                )
              }
            />
          </div>

          {!result.marketTracked && <p className="text-xs text-muted-foreground">{t.notTracked}</p>}
          {result.ordersTotal != null && (
            <p className="text-xs text-muted-foreground">{t.ordersTotal}: {formatNumber(result.ordersTotal)}</p>
          )}

          {result.checks.length > 0 && (
            <div className="rounded-2xl border p-5 space-y-2">
              <h3 className="text-sm font-bold">{t.checksTitle}</h3>
              <ul className="space-y-1.5 text-xs">
                {result.checks.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {c.ok ? <Check className="size-4 text-emerald-600" /> : <X className="size-4 text-amber-600" />}
                    <span className="font-medium">{c.label}:</span>
                    <span className="text-muted-foreground">{c.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">{t.source}</p>

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

function Tile({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={accent ? "text-xl font-extrabold text-primary" : "text-xl font-extrabold text-foreground"}>{value}</div>
    </div>
  );
}
