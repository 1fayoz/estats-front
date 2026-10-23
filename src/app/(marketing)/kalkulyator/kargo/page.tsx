import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { ChinaCargoCalculator } from "@/features/calculators/china-cargo-calculator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Xitoy Kargo Tan Narxi Kalkulyatori (1688, Taobao)",
  description:
    "1688 va Taobao tovarlarining kargo, yuan kursi, dostavka va qadoqlash xarajatlarini hisoblang: Toshkentgacha 1 dona tan narxi va tavsiya narx.",
  path: "/kalkulyator/kargo",
  keywords: [
    "xitoy kargo kalkulyator",
    "1688 tovar tan narxi",
    "kargo narxini hisoblash toshkent",
    "taobao yetkazib berish narxi",
    "uzum tovar marjasi hisoblash",
    "kargo kg narxi xitoy",
    "xitoydan tovar olib kelish xarajatlari",
  ],
  ogTitle: "Xitoy (1688 / Taobao / Kargo) Tan Narxi Kalkulyatori — eStats",
  ogDescription: "1688 dan tovar keltirishda yuan kursi, kargo va qadoqni hisoblab 1 dona sof tan narxni chiqaring.",
});

const FAQ_ITEMS = [
  {
    question: "Xitoydan kelgan tovarning tan narxiga qaysi xarajatlar kiradi?",
    answer:
      "Sof tan narx mahsulotning 1688 fabrikasidagi narxi, Xitoy ichidagi yetkazish (kargo omboriga), O'zbekistonga xalqaro kargo (kg yoki kub bo'yicha), sug'urta (1-2%), mahalliy qadoqlash va etiketka hamda brak zaxirasidan tashkil topadi.",
  },
  {
    question: "Kargo tariflari Avto va Avia bo'yicha qanday farqlanadi?",
    answer:
      "Avto/Temiryo'l kargo odatda $3.5 dan $5.0 gacha bo'lib, 14-22 kun davom etadi va og'ir/arzon mahsulotlar uchun juda foydali. Avia kargo esa $6.5 dan $9.0 gacha bo'lib, 5-8 kunda keladi va yengil, qimmat gadjetlar va trend tovarlar uchun tavsiya etiladi.",
  },
  {
    question: "Uzum Marketda sotish uchun tovar narxiga qancha ustama qo'yish kerak?",
    answer:
      "Uzum Market komissiyasi o'rtacha 15-25% ni tashkil qiladi. Foyda bilan chiqish uchun tovar tan narxini kamida 2-2.5 baravarga ko'paytirib sotuv narxini belgilash tavsiya etiladi (50%+ sof marja uchun).",
  },
];

export default function CargoCalculatorPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Bosh sahifa", url: "/" },
          { name: "Kalkulyatorlar", url: "/kalkulyator/uzum-komissiya" },
          { name: "Xitoy Kargo tan narxi", url: "/kalkulyator/kargo" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <ChinaCargoCalculator locale="uz" />
    </article>
  );
}
