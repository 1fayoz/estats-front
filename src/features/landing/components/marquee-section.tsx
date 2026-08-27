const ITEMS = [
  { label: "SEO audit", note: "60 ta kalit so'z" },
  { label: "Qidiruvdagi o'rin", note: "har kuni o'lchanadi" },
  { label: "Raqobatchilar", note: "kim oldingizda" },
  { label: "FIFO tan narx", note: "partiya bo'yicha" },
  { label: "Sof foyda", note: "komissiyadan keyin" },
  { label: "Uzum yechimlari", note: "jarima, saqlash" },
  { label: "Doimiy xarajatlar", note: "oylik taqsimot" },
  { label: "Ombor qoldig'i", note: "ogohlantirish bilan" },
  { label: "Instagram · Telegram", note: "bitta tugma bilan" },
  { label: "Sharhlar tahlili", note: "AI xulosasi" },
  { label: "Rasm tahlili", note: "AI ko'radi" },
  { label: "Excel eksport", note: "har bo'lim varaqda" },
];

/**
 * Imkoniyatlar lentasi.
 *
 * Ro'yxat aylanib turadi: o'nlab imkoniyatni ustma-ust yozib chiqish
 * sahifani cho'zadi va hech kim oxirigacha o'qimaydi, lenta esa
 * hajmni bir necha soniyada his qildiradi.
 */
export function MarqueeSection() {
  return (
    <section className="overflow-hidden border-y bg-muted/30 py-5">
      <div className="flex w-max landing-marquee gap-3">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3" aria-hidden={copy === 1}>
            {ITEMS.map((item) => (
              <span
                key={item.label}
                className="flex shrink-0 items-baseline gap-2 rounded-full border bg-card px-4 py-2 text-sm"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.note}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
