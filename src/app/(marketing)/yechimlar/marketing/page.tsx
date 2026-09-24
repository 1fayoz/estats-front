import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Megaphone, Send, Share2, Sparkles, Target, Zap } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Marketpleys Marketing va Reklama Nazorati — Boost TOP, DRR, Telegram va Instagram | eStats",
  description:
    "Uzum Boost TOP reklamalarini tahlil qilish, DRR va ROAS ni hisoblash, samarasiz reklama xarajatlarini to'xtatish. Telegram va Instagram orqali tashqi trafik va avtoposting imkoniyatlari.",
  keywords: [
    "boost top uzum",
    "marketpleys reklama tahlili",
    "drr hisoblash",
    "uzum reklama optimizatsiyasi",
    "telegram avtoposting marketplace",
    "instagram savdo marketpleys",
    "marketpleys marketing",
    "roas tahlili",
    "tashqi trafik uzum",
  ],
  alternates: { canonical: "/yechimlar/marketing" },
  openGraph: {
    title: "Marketpleys Reklama va Marketing Boshqaruvi — Har bir sarflangan so'm natija bersin",
    description:
      "Boost TOP reklama audit, DRR nazorati, Telegram va Instagram orqali ko'proq mijoz jalb qilish.",
    url: "https://estats.uz/yechimlar/marketing",
  },
};

const FAQ_ITEMS = [
  {
    question: "Boost TOP reklamada DRR (Доля рекламных расходов) qanday hisoblanadi?",
    answer:
      "DRR = (Reklamaga ketgan xarajat / Reklama orqali qilingan savdo) * 100%. eStats har bir tovar bo'yicha DRR ni real vaqtda ko'rsatadi. Agar tovar marjasi 20% bo'lsa va DRR 25% bo'lsa, siz har bir sotuvdan zarar ko'rayotgan bo'lasiz. eStats buni darhol qizil bilan ogohlantiradi.",
  },
  {
    question: "Telegram va Instagram avtoposting qanday ishlaydi?",
    answer:
      "eStats orqali siz tovarlaringiz kartochkalari, narxlari va havolalarini to'g'ridan-to'g'ri Telegram kanalingizga yoki Instagram sahifangizga avtomatik chiroyli formatda post qilib chiqarishingiz mumkin. Bu tashqi bepul trafik oqimini yaratadi.",
  },
  {
    question: "Reklama kalit so'zlari va pozitsiyalarni optimallashtirish mumkinmi?",
    answer:
      "Ha. Qaysi kalit so'zlar bo'yicha tovaringiz ko'proq bosilayotgani va sotilayotganini tahlil qilib, foydasiz so'zlarga pul sarflashni to'xtatishingiz mumkin.",
  },
];

export default function MarketingSolutionPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Yechimlar", url: "/yechimlar/marketing" },
          { name: "Marketing va Reklama", url: "/yechimlar/marketing" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Megaphone className="size-3.5" /> Marketing va Reklama Nazorati
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Marketpleyslar uchun <span className="text-primary">samarali reklama va trafik boshqaruvi</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Reklamaga pul sochishni bas qiling. Uzum Boost TOP xarajatlarining haqiqiy rentabelligini (DRR)
          biling va Telegram hamda Instagram orqali tashqi xaridorlar oqimini oshiring.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Target className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Boost TOP va DRR nazorati</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reklama tovaringizga foyda keltiryaptimi yoki budjetni yeb qo&apos;yyaptimi? DRR va ROAS ko&apos;rsatkichlari
            bilan har bir aksiyani to&apos;g&apos;ri baholang.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Send className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Telegram avtoposting</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Katalogdagi tovarlarni Telegram kanallarga bir klik bilan e&apos;lon qiling. Rasm, narx va marketpleysga
            to&apos;g&apos;ridan-to&apos;g&apos;ri havola avtomatik shakllanadi.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Share2 className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Instagram va Tashqi trafik</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ijtimoiy tarmoqlardagi auditoriyangizni to&apos;g&apos;ri do&apos;konga yo&apos;naltiring. Tashqi trafik
            marketpleys algoritmlarida tovaringizning organik o&apos;rnini keskin ko&apos;taradi.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Marketing budjetingizni 2 baravar tejang</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Zarar keltirayotgan reklama kampaniyalarini zudlik bilan to'xtatish",
            "Maksimal konversiya berayotgan top kalit so'zlarga budjetni yo'naltirish",
            "Ijtimoiy tarmoqlar (Telegram, Instagram) uchun postlar tayyorlash vaqtini tejash",
            "Organik qidiruv va pullik reklama o'rtasidagi to'g'ri balansni topish",
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
        <h3 className="text-2xl font-bold">Reklamangiz har kuni foyda keltirsin</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats marketing tahlili bilan har bir so&apos;m reklama xarajati ko&apos;proq savdo va daromadga aylansin.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Marketingni boshlash <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
