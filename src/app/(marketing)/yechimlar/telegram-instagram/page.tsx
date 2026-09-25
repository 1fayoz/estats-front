import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MessageSquare, Send, Share2, Sparkles, TrendingUp, Users } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Telegram va Instagram Avtoposting — Marketpleys Tovarlarini Ijtimoiy Tarmoqlarda Sotish | eStats",
  description:
    "Uzum va boshqa marketpleys tovarlaringizni 1 klik bilan Telegram kanal va guruhlarga, Instagram sahifalarga avtomatik joylang. Rasm, narx, tavsif va to'g'ridan-to'g'ri xarid havolasi.",
  keywords: [
    "telegram avtoposting tovar",
    "instagram savdo marketpleys",
    "uzum telegram kanal integratsiya",
    "tovarlarni telegramga tashlash",
    "tashqi trafik uzum",
    "marketpleys smm",
    "telegram bot do'kon",
  ],
  alternates: { canonical: "/yechimlar/telegram-instagram" },
  openGraph: {
    title: "Telegram va Instagram Avtoposting — Marketpleys sotuvchilari uchun tashqi trafik",
    description: "Ijtimoiy tarmoqlardagi obunachilaringizni marketpleysdagi xaridorlarga aylantiring.",
    url: "https://estats.uz/yechimlar/telegram-instagram",
  },
};

const FAQ_ITEMS = [
  {
    question: "Telegram kanalga tovar joylash qanday ishlaydi?",
    answer:
      "eStats katalogingizdan kerakli tovarlarni tanlaysiz va «Kanalga chiqarish» tugmasini bosasiz. Tizim tovar rasmi, amaldagi narxi, chegirmasi va marketpleysdagi xarid havolasi bilan birgalikda estetik post shaklida Telegram kanalingizga yuboradi.",
  },
  {
    question: "Narx o'zgarganda postdagi narx ham yangilanadimi?",
    answer:
      "Ha, avtomatik sinxronizatsiya orqali narxlar va chegirmalar doimo dolzarb bo'lib turadi.",
  },
  {
    question: "Tashqi trafik marketpleysdagi reytingga qanday ta'sir qiladi?",
    answer:
      "Uzum va boshqa bozor algoritmlari tashqi manbalardan (Telegram, Instagram, TikTok) kelgan xaridorlarni juda yuqori baholaydi. Qancha ko'p tashqi tashrif bo'lsa, tovaringizning organik qidiruvdagi o'rni shuncha tez ko'tariladi.",
  },
];

export default function TelegramInstagramSolutionPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Yechimlar", url: "/yechimlar/telegram-instagram" },
          { name: "Telegram va Instagram Avtoposting", url: "/yechimlar/telegram-instagram" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Send className="size-3.5" /> SMM & Tashqi Trafik
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Telegram va Instagram orqali <span className="text-primary">marketpleys savdosini 2x oshiring</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Faqatgina bozor ichidagi xaridorlarni kutib o&apos;tirmang. Ijtimoiy tarmoqlardagi obunachilaringizga
          tovarlaringizni chiroyli avtopostlar orqali ko&apos;rsatib, to&apos;g&apos;ri do&apos;koningizga yo&apos;naltiring.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Send className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Telegram avtoposting</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Qo&apos;lda rasm va matn tayyorlashga soatlab vaqt sarflamang. Bir klik bilan tovarlar kartochkasini
            Telegram kanalingizga professional ko&apos;rinishda e&apos;lon qiling.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <Share2 className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Instagram do&apos;kon</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Instagram obunachilaringiz uchun tovar katalogini shakllantiring. Direct va stories orqali
            xaridorlarni to&apos;g&apos;ri savatga olib boring.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <TrendingUp className="size-8 text-primary" />
          <h3 className="font-semibold text-lg">Algoritmik ustunlik</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tashqi trafik olib kelgan tovarlar marketpleysning ichki reytingida tez ko&apos;tariladi va
            bepul tavsiyalar lentasiga (rekomendatsiya) chiqadi.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Qanday imkoniyatlar mavjud?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Avtomatik narx va chegirma ko'rsatuvchi Telegram postlar shabloni",
            "Mavsumiy tovarlar to'plamini (podborka) bir necha daqiqada yaratish",
            "Tashqi havolalar orqali kelgan xaridorlar va konversiya tahlili",
            "Sotuvchilar va menejerlar uchun oson va qulay boshqaruv interfeysi",
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
        <h3 className="text-2xl font-bold">Kanal va sahifalaringiz daromad keltirsin</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats bilan ijtimoiy tarmoqlar va marketpleys savdosini bitta tizimda birlashtiring.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            SMM avtomatizatsiyasini yoqish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
