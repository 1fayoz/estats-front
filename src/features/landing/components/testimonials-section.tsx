import { Quote, Star } from "lucide-react";

const QUOTES = [
  {
    name: "Yekaterina R.",
    store: "@beauty_premium",
    avatar: "ER",
    rating: 5,
    text: "Kalit so'zlar haqiqatdan ishlayapti! Kartochkaga qo'shdim, Boost kampaniyalarda foydalandim — organik pozitsiya 3 kundan keyin yuqoriga ko'tarildi.",
    metric: "Pozitsiya: #18 → #4",
  },
  {
    name: "Mixail K.",
    store: "@anor_store",
    avatar: "MK",
    rating: 5,
    text: "Yo'qolgan mahsulotlar bo'limi orqali oldin 0.003% deb hisoblagan farqlarni aniqladim. Eksport qilib Uzumga taqdim qildim — kompensatsiya oldim.",
    metric: "8.4M so'm qoplandi",
  },
  {
    name: "Andrey M.",
    store: "@mark_ryden_club",
    avatar: "AM",
    rating: 5,
    text: "Vosita zo'r ishlaydi. Eng muhimi — bitta dashboardda barchasi: raqobatchilar, SEO, finance. Vaqtimni juda tejaydi.",
    metric: "Soatlab vaqt tejandi",
  },
  {
    name: "Diyora T.",
    store: "@modabox_uz",
    avatar: "DT",
    rating: 5,
    text: "Photo Search funksiyasi bizning eng katta dushmanimiz — raqobatchini topish endi 10 soniya oladi, oldin 2-3 soat.",
    metric: "200+ SKU launch",
  },
  {
    name: "Bekzod H.",
    store: "@techbox",
    avatar: "BH",
    rating: 4.9,
    text: "Komissiya kalkulyatori ajoyib. Endi har bir mahsulot uchun aniq sof foydani bilaman. Reklama xarajatlarini ham hisobga olib bo'ladi.",
    metric: "ROI 2.4× yaxshilandi",
  },
  {
    name: "Lola P.",
    store: "@homestyle",
    avatar: "LP",
    rating: 5,
    text: "Monitoring boti har 4 soatda raqobatchining narx o'zgarishidan xabardor qiladi. Bozorda doim eng yaxshi narxda qolaman.",
    metric: "Konversiya +34%",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Star className="h-3 w-3 fill-current" />
            Foydalanuvchilar fikri
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="gradient-text">1 400+</span> sotuvchi bizni tanlagan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Uzum Marketdagi yetakchi do'konlar eStats bilan ishlamoqda.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {QUOTES.map((q) => (
            <div
              key={q.name}
              className="group relative rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/10" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-info text-sm font-bold text-white">
                  {q.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">{q.name}</div>
                  <div className="text-xs text-muted-foreground">{q.store}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.floor(q.rating)
                        ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        : "h-3.5 w-3.5 text-muted-foreground/30"
                    }
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed">{q.text}</p>
              <div className="mt-4 inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ {q.metric}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 text-center">
          {[
            { value: "1 400+", label: "Faol sotuvchi" },
            { value: "12M+", label: "Tahlil qilingan SKU" },
            { value: "4.9 ★", label: "O'rtacha baho" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold tabular-nums gradient-text md:text-3xl">{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
