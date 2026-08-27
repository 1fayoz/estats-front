"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Do'konimni qanday ulayman?",
    a:
      "Uzum sotuvchi kabinetidagi API tokenni Integratsiyalar bo'limiga qo'yasiz — " +
      "shu bilan tovarlar, sotuvlar va moliya tortiladi. Kalit so'zlarni o'lchash " +
      "uchun qo'shimcha bozor tokeni kerak: uni bir marta bosiladigan yordamchi " +
      "havola oladi. Hammasi besh daqiqa.",
  },
  {
    q: "Tan narxni qayerdan olasiz?",
    a:
      "Hech qayerdan — uni faqat siz bilasiz va Uzum uni hech qachon ko'rmaydi. " +
      "Tan narx Kirimlar bo'limida partiya bo'yicha kiritiladi, foyda esa FIFO " +
      "bo'yicha hisoblanadi: avval kelgan partiya avval sotiladi. Tan narxi " +
      "kiritilmagan donalar hisobda yashirilmaydi, alohida ko'rsatiladi.",
  },
  {
    q: "Kartochkani o'zingiz o'zgartirasizmi?",
    a:
      "Yo'q. Uzum tovarni o'zgartirish huquqini API orqali bermaydi. Biz yangi " +
      "nom va tavsifni tayyorlab beramiz, siz uni nusxalab Uzum kabinetiga " +
      "qo'yasiz — bir necha soniya. Qaysi variantni qo'llaganingizni belgilab " +
      "qo'yish mumkin, keyingi tahlil o'zgarishni ko'radi.",
  },
  {
    q: "Ruscha matn ham kerakmi?",
    a:
      "Ha, va bu ko'pchilik e'tibordan chetda qoldiradigan joy. Rus xaridori " +
      "«бутылка для воды» deb qidiradi va o'zbekcha matnni topmaydi. Shuning " +
      "uchun audit ikki tilni alohida o'lchaydi va har biriga o'z bali beriladi.",
  },
  {
    q: "Ma'lumot qanchalik tez yangilanadi?",
    a:
      "Sotuv va moliya har 4 soatda tortiladi, qidiruvdagi o'rin esa kuniga bir " +
      "marta o'lchanadi. SEO tahlilini istalgan vaqtda o'zingiz ishga tushirishingiz " +
      "mumkin — u fonda ketadi va sahifani yopsangiz ham to'xtamaydi.",
  },
  {
    q: "Bir nechta do'kon ulash mumkinmi?",
    a:
      "Ha. Bitta hisobga bir necha do'kon ulanadi va ular bir-birining " +
      "ma'lumotini ko'rmaydi. Yuqoridagi ro'yxatdan qaysi do'kon bilan " +
      "ishlayotganingizni almashtirasiz.",
  },
];

export function FaqSection() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section id="savollar" className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Savollar</p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Ko&apos;p so&apos;raladigan savollar
        </h2>
      </div>

      <div className="mt-10 divide-y rounded-2xl border bg-card">
        {FAQ.map((item, index) => {
          const expanded = open === index;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : index)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    expanded && "rotate-180"
                  )}
                />
              </button>
              {expanded ? (
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
