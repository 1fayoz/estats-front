import { Puzzle, Check, Download, ScanSearch, Rocket } from "lucide-react";

const POINTS = [
  "Uzum.uz saytida har bir karta yonida real vaqtdagi analitika",
  "Boost TOP kampaniyalarini brauzerdan boshqarish",
  "Kalit so'z pozitsiyalarini bir klikda kuzatish",
  "Rasm bo'yicha qidiruvni o'ng tugma orqali ishga tushirish",
  "Minus so'zlarni avtomatik aniqlash va eksport qilish",
];

export function PluginSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Puzzle className="h-3.5 w-3.5" />
            Puzzle / Yandex Browser
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Brauzer kengaytmasi — <span className="gradient-text">to'g'ridan-to'g'ri Uzumda</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Saytdan chiqmasdan, har bir kartochka yonida analitik ma'lumotlarni ko'ring. Reklamani
            boshqaring, raqobatchilarni tahlil qiling.
          </p>

          <ul className="mt-6 space-y-2.5">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90">
              <Download className="h-4 w-4" />
              Puzzle'ga o'rnatish
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
              <Puzzle className="h-4 w-4" />
              Yandex Browser
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-info/20 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border bg-card/80 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <div className="mx-auto rounded-md bg-background/70 px-3 py-0.5 text-xs font-mono text-muted-foreground">
                uzum.uz/product/123
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between rounded-lg border bg-gradient-to-r from-primary/5 to-transparent p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Rocket className="h-4 w-4" />
                  eStats analitika
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  live
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "30k sotuv", value: "1 248" },
                  { label: "Daromad", value: "892M" },
                  { label: "Pozitsiya", value: "#3" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border bg-card p-2.5">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </div>
                    <div className="text-base font-bold tabular-nums">{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { k: "kalit so'z 1", pos: 2, ok: true },
                  { k: "kalit so'z 2", pos: 7, ok: true },
                  { k: "kalit so'z 3", pos: 24, ok: false },
                ].map((k) => (
                  <div
                    key={k.k}
                    className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-1.5 text-xs"
                  >
                    <span className="font-mono">{k.k}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 font-semibold ${
                        k.ok
                          ? "bg-emerald-500/15 text-emerald-600"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      #{k.pos}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-primary">
                  <ScanSearch className="h-3.5 w-3.5" />
                  O'xshash rasmlarni qidirish
                </div>
                <span className="text-[10px] text-muted-foreground">10 ta qoldi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
