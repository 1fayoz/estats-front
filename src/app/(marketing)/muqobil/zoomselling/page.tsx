import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "ZoomSelling Muqobili — eStats | Uzum va Multi-Marketplace Analitikasi",
  description:
    "ZoomSelling alternativi qidiryapsizmi? eStats — nafaqat Uzum Market, balki Yandex Market, Wildberries va Ozon tahlili, buxgalteriya darajasidagi FIFO tan narxi, ombor nazorati va AI yordamchilari bilan to'liq ustun platforma.",
  keywords: [
    "zoomselling",
    "zoomselling uzum",
    "zoomselling muqobili",
    "zoomselling alternativasi",
    "zoomselling narxi",
    "uzum analitika",
    "uzum market analitika dasturi",
    "estats vs zoomselling",
    "tovar tan narxi hisobi",
  ],
  alternates: { canonical: "/muqobil/zoomselling" },
  openGraph: {
    title: "ZoomSelling Muqobili — Nega 1 400+ sotuvchi eStats'ni tanlaydi?",
    description:
      "ZoomSelling ga nisbatan kengroq imkoniyatlar: ko'p bozorli tahlil (Uzum, Yandex, WB, Ozon), FIFO tan narx, ombor ERP va AI SEO.",
    url: "https://estats.uz/muqobil/zoomselling",
  },
};

const FAQ_ITEMS = [
  {
    question: "ZoomSelling bilan eStats o'rtasidagi asosiy farq nima?",
    answer:
      "ZoomSelling faqat Uzum Market bilan cheklangan va faqat tashqi tushumni ko'rsatadi. eStats esa Uzum, Yandex Market, Wildberries va Ozon kabi barcha bozorlarni birlashtiradi, har bir partiyaning tan narxini (FIFO) hisoblab haqiqiy sof foydani aniqlaydi, omborni boshqaradi va AI orqali tovar kartochkalari yaratadi.",
  },
  {
    question: "ZoomSelling'dan eStats'ga o'tish qiyinmi?",
    answer:
      "Juda oson. eStats'da ro'yxatdan o'tasiz, do'kon API kalitini kiritasiz va barcha tovarlar hamda sotuvlar tarixi bir necha daqiqada avtomatik yuklanadi. Hatto tokensiz ham bozor tahlilini darhol boshlashingiz mumkin.",
  },
  {
    question: "eStats narxlari ZoomSelling dan arzonroqmi?",
    answer:
      "eStats funksionaliga nisbatan ancha tejamkor narxlarni taklif etadi. Siz nafaqat tahlil skaneri, balki alohida sotib olinadigan ombor tizimi, foyda kalkulyatori va AI generatoriga ega bo'lasiz.",
  },
];

const COMPARISON = [
  { feature: "Uzum Market tahlili", zoomselling: true, estats: true },
  { feature: "Yandex Market, Wildberries, Ozon integratsiyasi", zoomselling: false, estats: true },
  { feature: "Partiyaviy FIFO tan narxi va sof foyda (PnL)", zoomselling: false, estats: true },
  { feature: "Ombor qoldiqlari, partiyalar va zaxira nazorati", zoomselling: false, estats: true },
  { feature: "Doimiy xarajatlarni tovarlarga taqsimlash", zoomselling: false, estats: true },
  { feature: "AI tovar kartochkasi (o'zbek va rus tillarida)", zoomselling: false, estats: true },
  { feature: "Telegram va Instagramga avtoposting", zoomselling: false, estats: true },
  { feature: "Uzum tokensiz bozor tahlili", zoomselling: false, estats: true },
  { feature: "Brauzer kengaytmasi (karta yonida tahlil)", zoomselling: true, estats: true },
  { feature: "Do'stona va tezkor zamonaviy interfeys", zoomselling: "O'rtacha", estats: true },
];

export default function ZoomSellingAlternativePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Muqobil", url: "/muqobil/zoomselling" },
          { name: "ZoomSelling muqobili", url: "/muqobil/zoomselling" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> Raqobatchilar tahlili
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          ZoomSelling muqobili: <span className="text-primary">Nega eStats tanlanadi?</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          ZoomSelling o&apos;rniga har tomonlama kuchliroq, ko&apos;p bozorli va aniq foydani ko&apos;rsatadigan
          zamonaviy tahlil platformasini qidiryapsizmi? eStats qanday afzalliklarga egaligini ko&apos;rib chiqing.
        </p>
      </header>

      {/* Comparison table */}
      <section aria-labelledby="compare-table-heading" className="space-y-4">
        <h2 id="compare-table-heading" className="text-2xl font-bold tracking-tight">
          eStats vs ZoomSelling: To&apos;liq solishtirma
        </h2>
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4 sm:p-5">Funksiyalar va imkoniyatlar</th>
                <th className="p-4 sm:p-5 text-center">ZoomSelling</th>
                <th className="p-4 sm:p-5 text-center bg-primary/10 text-primary font-bold">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium text-foreground sm:p-5">{row.feature}</td>
                  <td className="p-4 text-center sm:p-5">
                    {row.zoomselling === true ? (
                      <Check className="mx-auto size-5 text-emerald-600" />
                    ) : row.zoomselling === false ? (
                      <X className="mx-auto size-5 text-muted-foreground/40" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{row.zoomselling}</span>
                    )}
                  </td>
                  <td className="p-4 text-center bg-primary/5 sm:p-5 font-semibold text-primary">
                    <Check className="mx-auto size-5 text-emerald-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why eStats wins */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">
          ZoomSelling yetkazib berolmaydigan asosiy 4 ta ustunlik
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-base text-foreground">1. Haqiqiy Tan Narx va FIFO (PnL)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ZoomSelling faqatgina tushumni ko&apos;rsatadi. Agar tovaringiz 100 mln sotilgan bo&apos;lsa,
              ZoomSelling buni yutuq deb ko&apos;rsatadi. eStats esa 100 mln ichidagi tan narx, komissiya va
              logistikani hisoblab, siz haqiqatan foyda yoki zarar ko&apos;rganingizni aniq aytadi.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-base text-foreground">2. Multi-Marketplace ekotizimi</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Biznesingiz faqat bitta bozor bilan cheklanmasligi kerak. eStats Uzum Market, Yandex Market,
              Wildberries va Ozon hisoblarini bitta qulay kabinetda boshqarish imkonini beradi.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-base text-foreground">3. To&apos;liq Ombor Nazorati (ERP)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Qaysi partiya qachon kelgan, qancha qolgan, qaysi tovarlar zaxirasi tugamoqda — barchasi
              nazoratda. Bir xil tovarlarni birlashtirish orqali ortiqcha adashishlarga chek qo&apos;yiladi.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-base text-foreground">4. AI SEO va Ijtimoiy Marketing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O&apos;zbek va rus tillarida yuqori konversiyali tavsiflar yozuvchi AI yordamchi hamda tovarlarni
              to&apos;g&apos;ridan-to&apos;g&apos;ri Telegram/Instagramga e&apos;lon qiluvchi integratsiya faqat eStats&apos;da.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <footer className="rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-card p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold sm:text-3xl text-foreground">
          eStats bilan savdongizni yangi bosqichga olib chiqing
        </h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
          1 400 dan ortiq yetakchi do&apos;konlar eStats orqali o&apos;z foydasini nazorat qilmoqda.
          Hech qanday to&apos;lovsiz bugunoq sinab ko&apos;ring.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
          >
            Bepul boshlash <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/#narxlar"
            className="inline-flex items-center gap-2 rounded-xl border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Tariflarni ko&apos;rish
          </Link>
        </div>
      </footer>
    </article>
  );
}
