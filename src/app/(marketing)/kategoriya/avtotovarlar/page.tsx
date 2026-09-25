import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Car, Check, Flame, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Uzum Market Avtotovarlar Bozor Tahlili — Avtomobil Aksessuarlari va Gadjetlar | eStats",
  description:
    "Uzum Market'dagi avtotovarlar, video registratorlar, avtoximiya, chexollar va mashina aksessuarlari tahlili: o'rtacha chek, eng ko'p sotilayotgan tovarlar va daromadli nishalar.",
  keywords: [
    "uzum avtotovarlar tahlili",
    "mashina aksessuarlari uzum",
    "videoregistrator sotuvlari uzum",
    "avtoximiya uzum market",
    "avtotovarlar aylanmasi",
    "eng kop sotiladigan avto tovarlar",
  ],
  alternates: { canonical: "/kategoriya/avtotovarlar" },
  openGraph: {
    title: "Avtotovarlar Bozor Tahlili — Uzum Market | eStats",
    description: "Mashina aksessuarlari toifasida eng ko'p daromad keltirayotgan tovarlar.",
    url: "https://estats.uz/kategoriya/avtotovarlar",
  },
};

const FAQ_ITEMS = [
  {
    question: "Avtotovarlar toifasida xaridorni nima ko'proq jalb qiladi?",
    answer:
      "Haydovchilar tovarning sifati, qulayligi va mos keluvchi avtomobil modellari (masalan, Cobalt, Gentra, Tracker) aniq ko'rsatilgan infografikalarni juda yuqori baholashadi.",
  },
  {
    question: "Videoregistratorlar va elektron aksessuarlarda kafolat muhimmi?",
    answer:
      "Albatta. Kamida 1-3 oylik rasmiy kafolat ko'rsatilgan kartochkalarda xaridorlar ishonchi va savdolar hajmi 40-50% yuqoriroq bo'ladi.",
  },
];

export default function AutoCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kategoriyalar", url: "/kategoriya/avtotovarlar" },
          { name: "Avtotovarlar va Aksessuarlar", url: "/kategoriya/avtotovarlar" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Car className="size-3.5" /> Bozor Toifasi Tahlili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Uzum Market <span className="text-primary">Avtotovarlar</span> tahlili
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          O&apos;zbekistonda avtomobillar soni ortishi bilan avtotovarlarga talab jadal o&apos;smoqda.
          Eng ko&apos;p sotilayotgan aksessuarlar va daromadli nishalarni bilib oling.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha chek</span>
          <p className="text-2xl font-extrabold text-foreground">165 000 so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Oylik bozor aylanmasi</span>
          <p className="text-2xl font-extrabold text-primary">22+ mlrd so&apos;m</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;rtacha komissiya</span>
          <p className="text-2xl font-extrabold text-emerald-600">12% - 15%</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-1">
          <span className="text-xs text-muted-foreground">O&apos;sish sur&apos;ati</span>
          <p className="text-2xl font-extrabold text-primary">+35% / yiliga</p>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Kategoriyadagi eng xaridorgir tovarlar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Videoregistratorlar, orqani ko'rish kameralari va radar detektorlar",
            "Telefon ushlagichlar, FM modulyatorlar va salon zaryadniklari",
            "Avtoximiya: salon tozalagichlar, qoraytirgichlar va polirovkalar",
            "Mavsumiy tovarlar: qishki antifriz, yozgi quyosh to'siqlar va chexollar",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Check className="size-3.5" />
              </div>
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Ko&apos;p beriladigan savollar</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="rounded-2xl border bg-card p-4 sm:p-5">
              <summary className="font-semibold cursor-pointer text-foreground">{item.question}</summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">Avtotovarlar toifasiga to&apos;g&apos;ri tovar bilan kiring</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats tahlili orqali qaysi avto aksessuarlar eng tez sotilayotganini aniqlang.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Bozor tahlilini ochish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
