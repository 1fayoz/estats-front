import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { ReturnsLossCalculator } from "@/features/calculators/returns-loss-calculator";

export const metadata: Metadata = {
  title: "Qaytgan Tovarlar (Vozvrat) va Zarar Kalkulyatori — Uzum Market va Wildberries | eStats",
  description:
    "Uzum Market va Wildberries'da xaridorlar qaytargan tovarlar sababli yillik va oylik sof zararni, teskari logistika to'lovlarini va brak xarajatlarini bepul hisoblang.",
  keywords: [
    "uzum vozvrat hisoblash",
    "uzum tovar qaytishi zarari",
    "vozvrat kalkulyator uzum",
    "wildberries qaytarilgan tovar xarajati",
    "marketpleys zararlarni hisoblash",
    "ombor brak tovar hisobi",
  ],
  alternates: {
    canonical: "/kalkulyator/vozvrat-zarari",
    languages: {
      uz: "/kalkulyator/vozvrat-zarari",
      ru: "/ru/kalkulyator/vozvrat-zarari",
    },
  },
  openGraph: {
    title: "Qaytgan Tovarlar (Vozvrat) Zararini Hisoblash Kalkulyatori",
    description: "Vozvratlar tufayli cho'ntagingizdan qancha pul ketayotganini aniqlang.",
    url: "https://estats.uz/kalkulyator/vozvrat-zarari",
  },
};

const FAQ_ITEMS = [
  {
    question: "Uzum Market'da tovar qaytsa (vozvrat) sotuvchidan pul yechiladimi?",
    answer:
      "Ha, tovar qaytgan taqdirda sotuvchiga tovar summasi tushmaydi, aksincha qaytarish va kuryerlik logistika xizmatlari uchun to'lov sotuvchi balansidan yechib olinadi.",
  },
  {
    question: "Vozvrat foizini qanday kamaytirish mumkin?",
    answer:
      "Eng samarali usul — mahsulot kartochkasida to'g'ri o'lcham jadvalini (razmernaya setka) ko'rsatish, AI orqali tovarning barcha xususiyatlarini aniq yozish va mustahkam qadoq ishlatishdir.",
  },
  {
    question: "eStats qaytgan tovarlarni qanday hisobga oladi?",
    answer:
      "eStats FIFO algoritmi orqali qaytgan tovarning partiyadagi dastlabki tan narxini tiklaydi, yo'qotilgan logistika xarajatlarini PnL moliya hisobotida aks ettiradi.",
  },
];

export default function ReturnsLossPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/uzum-komissiya" },
          { name: "Vozvrat va zarar kalkulyatori", url: "/kalkulyator/vozvrat-zarari" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
          Moliyaviy Xavfsizlik Vositalari
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Uzum va Wildberries Qaytgan Tovarlar (Vozvrat) Zararini Hisoblash
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Ko‘plab sotuvchilar oylik oborotga qarab o‘zlarini foydada deb o‘ylashadi, ammo qaytarilgan tovarlar logistikasi
          va shikastlangan qadoqlar hisobiga yiliga o‘nlab million so‘m yo‘qotishadi. Ushbu kalkulyator orqali real raqamlarni ko‘ring.
        </p>
      </header>

      <ReturnsLossCalculator locale="uz" />
    </article>
  );
}
