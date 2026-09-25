import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Layers, Package, ShieldCheck, X } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "FBO yoki FBS: Uzum Marketda Qaysi Birini Tanlash Ma'qul? — Taqqoslash | eStats",
  description:
    "FBO (Fulfillment by Operator) va FBS (Fulfillment by Seller) modellari solishtirmasi. Yangi sotuvchilar uchun qaysi biri arzonroq, tezroq va qulayroq? Barcha xarajatlar va farqlar.",
  keywords: [
    "fbo va fbs farqi",
    "uzum fbo nima",
    "uzum fbs nima",
    "uzum fulfillment",
    "fbo yoki fbs qaysi biri yaxshi",
    "marketpleys logistika modellari",
  ],
  alternates: { canonical: "/qollanma/fbo-fbs-farqi" },
  openGraph: {
    title: "FBO yoki FBS: Qaysi Birini Tanlash Kerak? — eStats Qo'llanma",
    description: "Uzum Market logistika modellarining to'liq tahlili va taqqoslanishi.",
    url: "https://estats.uz/qollanma/fbo-fbs-farqi",
  },
};

export default function FboVsFbsGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Qo'llanmalar", url: "/qollanma" },
          { name: "FBO yoki FBS farqi", url: "/qollanma/fbo-fbs-farqi" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Layers className="size-3.5" /> Logistika Modellari
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          FBO yoki FBS: <span className="text-primary">qaysi birini tanlash kerak?</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Uzum omboriga topshirish va o&apos;z omboringizdan jo&apos;natish o&apos;rtasidagi barcha farqlar,
          xarajatlar va eng to&apos;g&apos;ri strategiya.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Package className="size-8 text-primary" />
            <h2 className="text-2xl font-bold">FBO (Uzum ombori)</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tovarlaringizni partiya qilib Uzumning asosiy omboriga (masalan, Toshkentdagi logistika markaziga)
            topshirasiz. Buyurtma tushganda Uzumning o&apos;zi 1 kunda qadoqlab xaridorga yetkazadi.
          </p>
          <div className="space-y-2 pt-2 border-t text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Afzalliklari:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-500" /> 1 kunda yetkazib berish (Maksimal savdo)</li>
              <li className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-500" /> Qadoqlash va jo&apos;natish tashvishidan xolis bo&apos;lish</li>
              <li className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-500" /> Xaridorlar FBO tovarlarni ko&apos;proq tanlaydi</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="size-8 text-primary" />
            <h2 className="text-2xl font-bold">FBS (O&apos;z omboringiz)</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tovarlar sizning shaxsiy omboringiz yoki do&apos;koningizda saqlanadi. Buyurtma tushgach, uni o&apos;zingiz
            qadoqlab, belgilangan vaqt ichida Uzum qabul qilish punktiga topshirasiz.
          </p>
          <div className="space-y-2 pt-2 border-t text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Afzalliklari:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-500" /> Katta va og&apos;ir tovarlar uchun saqlash puli to&apos;lanmaydi</li>
              <li className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-500" /> Yangi tovar talabini xavfsiz sinab ko&apos;rish (Test)</li>
              <li className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-500" /> Tovarni bir vaqtning o&apos;zida oflayn ham sotish</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border bg-card p-8 sm:p-10 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Xulosa: Yangi boshlovchi nima qilishi kerak?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Agar tovaringiz ixcham va yengil bo&apos;lsa, <strong>FBO modelini</strong> tanlagan ma&apos;qul.
          Uzumning 1 kunlik yetkazib berishi savdolaringizni 3-5 barobar tezlashtiradi.
          Agar tovaringiz qimmat, katta hajmli yoki talabiga hali ishonchingiz komil bo&apos;lmasa, avval <strong>FBS modelida</strong> sinab ko&apos;rish tavsiya etiladi.
        </p>
      </section>

      <footer className="rounded-3xl border bg-card p-8 text-center sm:p-12 space-y-4">
        <h3 className="text-2xl font-bold">FBO va FBS partiyalarini eStats bilan nazorat qiling</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          Qaysi modelda savdo qilishingizdan qat&apos;i nazar, ombor va FIFO hisobini aniq yuriting.
        </p>
        <div className="pt-2">
          <Link
            href="/yechimlar/ombor"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
          >
            Ombor dasturini ko&apos;rish <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
