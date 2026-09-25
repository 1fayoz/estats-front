import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CompareLocale = "uz" | "ru" | "en";
type Mark = "yes" | "no" | "partly";

const HEADERS = {
  uz: {
    eyebrow: "ZoomSelling va MPStats muqobili",
    title: "Nega sotuvchilar eStats'ni tanlamoqda?",
    description:
      "Oddiy skanerlar (ZoomSelling, MPStats) faqat umumiy tushumni ko'rsatadi. " +
      "eStats esa haqiqiy FIFO tan narxi, ombor nazorati, AI SEO va barcha marketpleyslarni " +
      "bitta mukammal kabinetga jamlaydi.",
    columns: ["ZoomSelling / MPStats", "Bozor kabineti", "eStats"] as const,
  },
  ru: {
    eyebrow: "Альтернатива ZoomSelling и MPStats",
    title: "Почему селлеры выбирают eStats?",
    description:
      "Обычные парсеры (ZoomSelling, MPStats) видят только внешнюю выручку. " +
      "eStats объединяет реальную себестоимость FIFO, остатки на складах FBO/FBS, AI SEO и все маркетплейсы " +
      "в единую систему управления.",
    columns: ["ZoomSelling / MPStats", "Кабинет маркетплейса", "eStats"] as const,
  },
  en: {
    eyebrow: "ZoomSelling & MPStats Alternative",
    title: "Why sellers are switching to eStats",
    description:
      "Basic public scrapers only track gross revenue. " +
      "eStats unifies true FIFO purchase costing, multi-channel stock sync, bilingual AI SEO, and order analytics " +
      "into one comprehensive operating system.",
    columns: ["ZoomSelling / MPStats", "Marketplace Portal", "eStats"] as const,
  },
};

const ROWS_BY_LOCALE: Record<CompareLocale, { label: string; marks: [Mark, Mark, Mark]; note?: string }[]> = {
  uz: [
    { label: "Uzum, Yandex, WB, Ozon birlashuvi", marks: ["no", "no", "yes"], note: "Faqat eStats'da" },
    { label: "Sotuv va buyurtmalar tahlili", marks: ["yes", "yes", "yes"] },
    { label: "Komissiya va logistika hisobi", marks: ["partly", "yes", "yes"] },
    { label: "Tan narx bilan sof foyda (PnL)", marks: ["no", "no", "yes"], note: "Bozorlar sizning tan narxingizni bilmaydi" },
    { label: "FIFO — partiya bo'yicha tan narx", marks: ["no", "no", "yes"] },
    { label: "Ombor qoldiqlari va SKU nazorati", marks: ["no", "partly", "yes"] },
    { label: "Doimiy xarajatlar taqsimoti", marks: ["no", "no", "yes"] },
    { label: "Kalit so'zlar yadrosi & SEO", marks: ["partly", "no", "yes"] },
    { label: "O'zbekcha va ruscha AI kartochka", marks: ["no", "no", "yes"], note: "Faqat eStats'da" },
    { label: "Qidiruvdagi o'rin kuzatuvi", marks: ["yes", "no", "yes"] },
    { label: "Sharh va rasm tahlili (AI)", marks: ["no", "no", "yes"] },
    { label: "Telegram va Instagramga avtopost", marks: ["no", "no", "yes"] },
  ],
  ru: [
    { label: "Синхронизация Uzum, Yandex, WB, Ozon", marks: ["no", "no", "yes"], note: "Только в eStats" },
    { label: "Аналитика заказов и продаж", marks: ["yes", "yes", "yes"] },
    { label: "Учет комиссий и логистики маркетплейса", marks: ["partly", "yes", "yes"] },
    { label: "Себестоимость и чистая прибыль (PnL)", marks: ["no", "no", "yes"], note: "Маркетплейс не знает вашу себестоимость" },
    { label: "Партионный метод списания FIFO", marks: ["no", "no", "yes"] },
    { label: "Контроль остатков FBO/FBS и SKU", marks: ["no", "partly", "yes"] },
    { label: "Распределение постоянных расходов бизнеса", marks: ["no", "no", "yes"] },
    { label: "Ядро поисковых запросов и SEO анализ", marks: ["partly", "no", "yes"] },
    { label: "AI генерация карточек (UZ & RU)", marks: ["no", "no", "yes"], note: "Только в eStats" },
    { label: "Отслеживание позиций в поиске", marks: ["yes", "no", "yes"] },
    { label: "AI аудит отзывов и инфографики", marks: ["no", "no", "yes"] },
    { label: "Автопостинг в Telegram и Instagram", marks: ["no", "no", "yes"] },
  ],
  en: [
    { label: "Unified Uzum, Yandex, WB, Ozon sync", marks: ["no", "no", "yes"], note: "Exclusive to eStats" },
    { label: "Order & revenue analytics", marks: ["yes", "yes", "yes"] },
    { label: "Category commission & logistics tracking", marks: ["partly", "yes", "yes"] },
    { label: "True COGS & Net Margin (PnL)", marks: ["no", "no", "yes"], note: "Platforms cannot know purchase cost" },
    { label: "Strict FIFO batch inventory costing", marks: ["no", "no", "yes"] },
    { label: "FBO & FBS multi-channel stock sync", marks: ["no", "partly", "yes"] },
    { label: "Operating overhead expense allocation", marks: ["no", "no", "yes"] },
    { label: "High-intent search keyword extraction", marks: ["partly", "no", "yes"] },
    { label: "Bilingual AI listing generator", marks: ["no", "no", "yes"], note: "Exclusive to eStats" },
    { label: "Search rank position monitoring", marks: ["yes", "no", "yes"] },
    { label: "AI review sentiment & image audit", marks: ["no", "no", "yes"] },
    { label: "Direct Telegram & Instagram broadcasts", marks: ["no", "no", "yes"] },
  ],
};

function renderMark(mark: Mark, isPrimary: boolean) {
  if (mark === "yes") {
    return (
      <span className={cn("inline-flex size-6 items-center justify-center rounded-full", isPrimary ? "bg-primary text-primary-foreground" : "bg-emerald-500/10 text-emerald-600")}>
        <Check className="size-4" strokeWidth={3} />
      </span>
    );
  }
  if (mark === "partly") {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
        <Minus className="size-4" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
      <X className="size-4" />
    </span>
  );
}

export function CompareSection({ locale = "uz" }: { locale?: CompareLocale }) {
  const header = HEADERS[locale] || HEADERS.uz;
  const rows = ROWS_BY_LOCALE[locale] || ROWS_BY_LOCALE.uz;

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{header.eyebrow}</p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{header.title}</h2>
        <p className="mt-4 text-muted-foreground">{header.description}</p>
      </div>

      {/* Mobile view */}
      <div className="mt-10 space-y-2.5 md:hidden">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border bg-card p-4">
            <div className="text-sm font-medium">{row.label}</div>
            {row.note ? <div className="mt-0.5 text-xs text-muted-foreground">{row.note}</div> : null}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {row.marks.map((mark, index) => (
                <div key={index} className={cn("flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center text-xs", index === 2 && "border-primary/40 bg-primary/5 font-semibold text-primary")}>
                  <span className="text-[11px] text-muted-foreground">{header.columns[index]}</span>
                  {renderMark(mark, index === 2)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="mt-12 hidden overflow-hidden rounded-2xl border bg-card md:block shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="p-4 sm:p-5">{locale === "ru" ? "Возможность" : locale === "en" ? "Feature" : "Imkoniyat"}</th>
              <th className="w-48 p-4 text-center sm:p-5">{header.columns[0]}</th>
              <th className="w-48 p-4 text-center sm:p-5">{header.columns[1]}</th>
              <th className="w-48 bg-primary/5 p-4 text-center text-primary font-bold sm:p-5">{header.columns[2]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.label} className="transition hover:bg-muted/20">
                <td className="p-4 sm:p-5">
                  <div className="font-medium text-foreground">{row.label}</div>
                  {row.note ? <div className="text-xs text-muted-foreground mt-0.5">{row.note}</div> : null}
                </td>
                <td className="p-4 text-center sm:p-5">{renderMark(row.marks[0], false)}</td>
                <td className="p-4 text-center sm:p-5">{renderMark(row.marks[1], false)}</td>
                <td className="bg-primary/5 p-4 text-center sm:p-5">{renderMark(row.marks[2], true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
