import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Check, FileText, Sparkles, Star, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Tovar Kartochkasini To'ldirish va SEO — Qidiruvda 1-O'ringa Chiqish Yo'riqnomasi | eStats",
  description:
    "Uzum Marketda tovar kartochkasini to'g'ri to'ldirish: yuqori konversiyali nom tanlash, kalit so'zlar matritsasi, infografika va rich content yaratish sirlari.",
  keywords: [
    "uzum kartochka toldirish",
    "uzum tovar seo",
    "kartochka optimizatsiya uzum",
    "infografika uzum tovar",
    "uzum tovar nomini yozish",
    "rich content tayyorlash",
  ],
  alternates: { canonical: "/qollanma/kartochka-toldirish" },
  openGraph: {
    title: "Tovar Kartochkasini To'ldirish va SEO — eStats Qo'llanma",
    description: "Kartochkangizni xaridorlar va algoritm uchun mukammal qilib tayyorlang.",
    url: "https://estats.uz/qollanma/kartochka-toldirish",
  },
};

export default function CardOptimizationGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Qo'llanmalar", url: "/qollanma" },
          { name: "Tovar kartochkasini to'ldirish", url: "/qollanma/kartochka-toldirish" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> Tovar Optimizatsiyasi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Tovar kartochkasini <span className="text-primary">TOP ga chiqaradigan qilib to&apos;ldirish</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Reklamasiz bepul organik xaridorlarni jalb qilishning 4 ta oltin qoidasi.
        </p>
      </header>

      <section className="space-y-8 rounded-3xl border bg-card p-6 sm:p-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">1. Tovar nomi formulasi (SEO Title)</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tovar nomi algoritm uchun eng asosiy indeks manbaidir. Eng samarali formula:
          </p>
          <div className="rounded-2xl border bg-muted/30 p-4 font-mono text-sm text-foreground">
            [Tovar turi] + [Brend/Model] + [Asosiy xususiyat/Material] + [Kimga/Maqsad]
          </div>
          <p className="text-xs text-muted-foreground">
            Misol: <em>«Simsiz quloqchinlar ProPods Bluetooth 5.3, shovqinni bekor qiluvchi, sport va telefon uchun»</em>
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">2. Asosiy rasm va Infografika (CTR oshirish)</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Xaridor qidiruvda faqat rasmni ko&apos;radi. Tovarning asosiy 3 ta ustunligini (masalan: «Suv o&apos;tkazmaydi»,
            «48 soat quvvat», «Original sifat») to&apos;g&apos;ri rasm ustida chiroyli infografika bilan ko&apos;rsating.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">3. Rich Content va Xususiyatlar</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Uzum filtrlari (o&apos;lcham, rang, material, og&apos;irlik) to&apos;liq to&apos;ldirilgan kartochkalarni xaridorlarga
            ancha ko&apos;proq ko&apos;rsatadi. Har bir xususiyat qatorini bo&apos;sh qoldirmang.
          </p>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold tracking-tight">4. eStats AI Tovar Kopirayteridan foydalanish</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Matnlarni qo&apos;lda yozishga soatlab vaqt ketkazmang. eStats sun&apos;iy intellekti toifadagi top raqobatchilarni
            o&apos;rganib, o&apos;zbek va rus tillarida 100% SEO mos nom va tavsif tayyorlab beradi.
          </p>
        </div>
      </section>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">Kartochkalaringizni AI bilan avtomatlashtiring</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          eStats Tovar SEO moduli bilan tovarlaringiz reytingini oshiring.
        </p>
        <div className="pt-2">
          <Link
            href="/yechimlar/tovar-seo"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Tovar SEO haqida bilish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
