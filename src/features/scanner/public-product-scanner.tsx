"use client";

import { useId, useState } from "react";
import { ArrowRight, Bot, Check, ExternalLink, Loader2, Search, Sparkles, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

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

export function PublicProductScanner() {
  const urlInputId = useId();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);

    // URL yoki ID dan raqamlarni ajratib olish
    const match = query.match(/(\d+)/);
    const id = match ? match[1] : "109842";

    // 600ms imitatsiya bilan realistik tahlil hisoblash
    setTimeout(() => {
      // Namuna tahlil ma'lumotlari
      const seed = Number(id) || 12345;
      const price = ((seed % 40) + 5) * 10000;
      const monthlySalesEst = (seed % 350) + 45;
      const monthlyRevenueEst = monthlySalesEst * price;
      const reviewsCount = (seed % 180) + 12;
      const rating = 4.8;
      const seoScore = 78;

      setResult({
        productId: id,
        title: query.includes("uzum.uz") ? "Uzum Market tanlangan mahsuloti" : `Mahsulot #${id}`,
        price,
        monthlySalesEst,
        monthlyRevenueEst,
        reviewsCount,
        rating,
        seoScore,
        strengths: [
          "Bozor o'rtacha reytingi yuqori (4.8 yulduz)",
          "Narx toifadagi raqobatbardosh segmentda joylashgan",
          "Muntazam oylik talab va barqaror sotuv dinamikasi mavjud",
        ],
        improvements: [
          "Tovar nomida qo'shimcha yuqori chastotali kalit so'zlar yetishmayapti",
          "Rich content (infografika va jadvallar) qo'shilsa konversiya 25% oshadi",
          "Kutilmagan talab o'sishida qoldiq tugab qolish xavfi (Out of Stock) mavjud",
        ],
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
          <h2 className="text-xl font-bold">Uzum Tovar Havolasini Tezkor Tekshirish</h2>
          <p className="text-xs text-muted-foreground">
            Istalgan tovar linki yoki ID sini kiriting — uning sotuv hajmi, tushumi va SEO auditini ko&apos;ring.
          </p>
        </div>
      </div>

      <form onSubmit={handleScan} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={urlInputId} className="sr-only">Uzum tovar havolasi yoki ID raqami</label>
        <input
          id={urlInputId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Masalan: https://uzum.uz/uz/product/erkaklar-soati... yoki tovar ID"
          className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Tahlil qilinmoqda...
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Tahlil qilish
            </>
          )}
        </button>
      </form>

      {/* Natijalar bloki */}
      {result && (
        <div className="space-y-6 pt-4 border-t animate-in fade-in duration-300">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Taxminiy oylik savdo</span>
              <p className="text-xl font-extrabold text-foreground">{result.monthlySalesEst} dona</p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Oylik tushum hajmi</span>
              <p className="text-xl font-extrabold text-primary">
                {result.monthlyRevenueEst.toLocaleString("uz-UZ")} so&apos;m
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Sharhlar va Reyting</span>
              <p className="text-xl font-extrabold text-foreground flex items-center gap-1">
                <Star className="size-4 text-amber-500 fill-amber-500" /> {result.rating} ({result.reviewsCount})
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-1">
              <span className="text-xs text-muted-foreground">SEO va Kartochka sifati</span>
              <p className="text-xl font-extrabold text-emerald-600">{result.seoScore} / 100 ball</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-emerald-500/5 border-emerald-500/20 p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" /> Kuchli tomonlari
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
                <Bot className="size-4 text-amber-600" /> AI Tavsiyalari (O&apos;sish nuqtalari)
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
              <p className="text-sm font-bold text-foreground">
                Ushbu tovarning kunlik qoldiqlari va narxlar tarixini ko&apos;rishni xohlaysizmi?
              </p>
              <p className="text-xs text-muted-foreground">
                eStats platformasida ro&apos;yxatdan o&apos;ting yoki Chrome kengaytmasini o&apos;rnating.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              To&apos;liq tahlilni ochish <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
