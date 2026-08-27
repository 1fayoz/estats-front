import Link from "next/link";
import { ArrowRight, Check, TrendingUp } from "lucide-react";

import { BrowserFrame } from "./browser-frame";

const TRUST = [
  "Karta talab qilinmaydi",
  "5 daqiqada ulanadi",
  "Istalgan vaqtda bekor qilish",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Yumshoq nur — margn'dagidek, lekin bizning binafsha-zangori. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[8%] top-24 h-[380px] w-[380px] rounded-full bg-info/18 blur-[110px]" />
        <div className="absolute left-[6%] top-40 h-[300px] w-[300px] rounded-full bg-accent/60 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-10 pt-12 text-center sm:pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          Uzum Market · ma&apos;lumot har 4 soatda yangilanadi
        </div>

        <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
          Kartochkangizni ko&apos;ring.
          <br />
          <span className="gradient-text">Foydangizni sanang.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Uzumdagi tovaringiz qidiruvda topiladimi va qancha talab qo&apos;ldan
          ketyapti — hamda komissiya, logistika va tan narxdan keyin qo&apos;lda
          qancha pul qolayotgani. Bitta kabinetda.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
          >
            Bepul boshlash
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#mahsulot"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-6 py-3.5 text-base font-medium transition-colors hover:bg-muted sm:w-auto"
          >
            Qanday ishlaydi
          </Link>
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {TRUST.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Mahsulotning o'zi — landing'ning eng ishonarli qismi. */}
      <div className="relative mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
        <div className="relative">
          <BrowserFrame
            src="/shots/seo-audit.jpg"
            alt="eStats SEO audit: kartochka bali va tillar bo'yicha alohida o'lchov"
            url="estats.uz/seo"
            priority
            sizes="(max-width: 1024px) 100vw, 1100px"
          />

          <FloatCard
            className="-left-3 top-[26%] hidden sm:flex lg:-left-10"
            label="SEO BALL"
            value="81"
            delta="+15"
          />
          <FloatCard
            className="-right-3 top-[10%] hidden sm:flex lg:-right-8"
            label="QO'LDAN KETYAPTI"
            value="96 880"
            tone="bad"
          />
          <FloatCard
            className="-right-3 bottom-[14%] hidden md:flex lg:-right-12"
            label="RUSCHA KARTOCHKA"
            value="41"
            suffix="/85"
          />
        </div>
      </div>
    </section>
  );
}

function FloatCard({
  label,
  value,
  delta,
  suffix,
  tone,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  suffix?: string;
  tone?: "bad";
  className?: string;
}) {
  return (
    <div
      className={`absolute flex flex-col gap-1 rounded-xl border bg-card/95 px-4 py-3 shadow-xl shadow-foreground/5 backdrop-blur ${className}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span
          className={`text-xl font-bold tabular-nums ${tone === "bad" ? "text-destructive" : ""}`}
        >
          {value}
        </span>
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
        {delta ? (
          <span className="flex items-center gap-0.5 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" />
            {delta}
          </span>
        ) : null}
      </span>
    </div>
  );
}
