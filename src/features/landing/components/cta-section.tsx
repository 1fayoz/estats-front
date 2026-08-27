import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const POINTS = ["Karta talab qilinmaydi", "5 daqiqada ulanadi", "Istalgan vaqtda bekor qilish"];

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-16 text-center text-background sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, color-mix(in oklch, var(--primary) 55%, transparent), transparent 55%), radial-gradient(circle at 80% 80%, color-mix(in oklch, var(--info) 45%, transparent), transparent 55%)",
          }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Bugun ko&apos;rib chiqing — qancha talab qo&apos;ldan ketyapti
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-background/70">
            Do&apos;konni ulang va birinchi tahlilni bir necha daqiqada oling.
          </p>

          <Link
            href="/login"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-transform hover:scale-[1.02]"
          >
            Bepul boshlash
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-background/60">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
