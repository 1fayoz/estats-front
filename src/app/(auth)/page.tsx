import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";
import {
  Sparkles,
  BarChart3,
  Target,
  Wallet,
  ChevronRight,
} from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { PluginSection } from "@/features/landing/components/plugin-section";
import { BotSection } from "@/features/landing/components/bot-section";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { CasesSection } from "@/features/landing/components/cases-section";
import { TestimonialsSection } from "@/features/landing/components/testimonials-section";
import { MarketplacesSection } from "@/features/landing/components/marketplaces-section";
import { LandingFooter } from "@/features/landing/components/footer";

const HIGHLIGHTS = [
  {
    icon: BarChart3,
    title: "Real vaqtdagi statistika",
    desc: "Sotuvlar, daromad, konversiya va o'sish ko'rsatkichlari",
  },
  {
    icon: Target,
    title: "Raqobatchilar tahlili",
    desc: "Top do'konlar, brendlar va benchmark hisobotlar",
  },
  {
    icon: Wallet,
    title: "Komissiya kalkulyatori",
    desc: "Uzum to'lovlari, reklama va sof foyda",
  },
];

export default function EntryPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[840px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full bg-info/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <LogoMark size={38} priority className="h-9 w-9" />
            <div>
              <div className="text-base font-bold tracking-tight">{siteConfig.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                for Uzum sellers
              </div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#features" className="hover:text-foreground">Funksiyalar</Link>
            <Link href="#plugin" className="hover:text-foreground">Plagin</Link>
            <Link href="#bot" className="hover:text-foreground">Telegram</Link>
            <Link href="#pricing" className="hover:text-foreground">Tariflar</Link>
            <Link href="#cases" className="hover:text-foreground">Keyslar</Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur md:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              1 400+ sotuvchi
            </div>
            <Link
              href="#login"
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Kirish
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:py-16 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Uzum · Kaspi · Teez analitikasi
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Mahsulot va nishlarni toping,{" "}
              <span className="gradient-text">qidiruv va raqobatni ko'ring</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Uzum Marketdagi do'koningiz uchun to'liq analitika tizimi. Sotuvlar, raqobatchilar, SEO,
              Boost TOP boshqaruvi va har bir mahsulotdan olinadigan Uzum komissiyasi.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {HIGHLIGHTS.map((h) => (
                <div
                  key={h.title}
                  className="group rounded-xl border bg-card/60 p-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <h.icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold">{h.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{h.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <section id="login" className="flex items-center justify-center">
            <LoginForm />
          </section>
        </section>

        <MarketplacesSection />

        <div id="features">
          <FeaturesSection />
        </div>

        <div id="plugin">
          <PluginSection />
        </div>

        <div id="bot">
          <BotSection />
        </div>

        <div id="cases">
          <CasesSection />
        </div>

        <TestimonialsSection />

        <div id="pricing">
          <PricingSection />
        </div>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary via-info to-primary p-10 text-center text-white shadow-2xl shadow-primary/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Bugun bepul boshlang
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
                Demo rejimda barcha funksiyalarni sinab ko'ring. Bank kartasi talab qilinmaydi.
              </p>
              <Link
                href="#login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                Demo'ni boshlash
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
