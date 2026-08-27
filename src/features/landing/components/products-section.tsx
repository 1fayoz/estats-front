import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { BrowserFrame } from "./browser-frame";

const BLOCKS = [
  {
    eyebrow: "01 · Qidiruv",
    title: "SEO audit",
    lead: "Kartochkangiz qidiruvda topiladimi va qancha talab qo'ldan ketyapti.",
    points: [
      ["Kalit so'zlar yadrosi", "tovar, raqobatchilar, sharhlar va AI'dan"],
      ["Har ibora o'lchanadi", "talab, raqobat, sharh soni"],
      ["Ikki til alohida", "o'zbekcha va ruscha kartochka mustaqil"],
      ["Tuzatish matni", "AI yozadi, nusxalab qo'yasiz"],
    ],
    shot: "/shots/seo-audit.jpg",
    url: "estats.uz/seo",
    alt: "SEO audit ekrani",
  },
  {
    eyebrow: "02 · Pul",
    title: "Foyda va moliya",
    lead: "Tushum emas — komissiya, logistika va tan narxdan keyin qolgan pul.",
    points: [
      ["FIFO tan narx", "qaysi partiyadan sotilgani hisobga olinadi"],
      ["Uzum yechimlari", "komissiya, logistika, jarima, saqlash"],
      ["Doimiy xarajatlar", "oyma-oy taqsimlanadi"],
      ["Ochiq hisob", "tan narxi yo'q donalar yashirilmaydi"],
    ],
    shot: "/shots/pnl.jpg",
    url: "estats.uz/pnl",
    alt: "Foyda va zarar ekrani",
  },
  {
    eyebrow: "03 · Sotuv",
    title: "Ijtimoiy tarmoqlar",
    lead: "Bitta tovarni hamma tarmoqqa bitta tugma bilan joylang.",
    points: [
      ["Bitta joyda", "Instagram, Telegram, TikTok, LinkedIn"],
      ["Bog'lanish jadvali", "qaysi tovar qayerda chiqqan"],
      ["Fonda ketadi", "sahifani yopsangiz ham to'xtamaydi"],
      ["Obunachilar", "o'sish shu yerda ko'rinadi"],
    ],
    shot: "/shots/socials.jpg",
    url: "estats.uz/socials",
    alt: "Ijtimoiy tarmoqlar ekrani",
  },
];

export function ProductsSection() {
  return (
    <section id="mahsulot" className="border-t bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Bitta kabinet
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Sotuvchining butun ish tsikli
          </h2>
          <p className="mt-4 text-muted-foreground">
            Kartochkani yaxshilash, foydani sanash va e&apos;lon qilish — servislar
            orasida sakramasdan.
          </p>
        </div>

        <div className="mt-14 space-y-20">
          {BLOCKS.map((block, index) => (
            <div
              key={block.title}
              className={cn(
                "grid items-center gap-10 lg:grid-cols-2 lg:gap-14",
                index % 2 === 1 && "lg:[&>*:first-child]:order-2"
              )}
            >
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {block.eyebrow}
                </span>
                <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {block.title}
                </h3>
                <p className="mt-3 text-muted-foreground">{block.lead}</p>

                <dl className="mt-7 space-y-4">
                  {block.points.map(([term, note]) => (
                    <div key={term} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </span>
                      <div>
                        <dt className="text-sm font-medium">{term}</dt>
                        <dd className="text-sm text-muted-foreground">{note}</dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <Link
                  href="/login"
                  className="group mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  Sinab ko&apos;rish
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <BrowserFrame
                src={block.shot}
                alt={block.alt}
                url={block.url}
                className="shadow-xl"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
