"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import { BrowserFrame } from "./browser-frame";

type Question = {
  question: string;
  title: string;
  body: string;
  points: string[];
  shot: string;
  /** Telefon uchun o'sha ekranning telefondagi ko'rinishi. */
  mobileShot: string;
  url: string;
  alt: string;
};

const QUESTIONS: Question[] = [
  {
    question: "Kartochkam qidiruvda topiladimi?",
    title: "Kartochkam qidiruvda topiladimi?",
    body:
      "Har bir tovaringiz uchun kalit so'zlar yadrosi yig'iladi va uning qanchasi " +
      "nomda hamda tavsifda ishlatilgani o'lchanadi. Ball 100 dan — qaysi qism " +
      "necha ball berayotgani ochiq ko'rinadi.",
    points: [
      "Nom, tavsif, kalit so'zlar va xususiyatlar — alohida ball",
      "O'zbekcha va ruscha kartochka MUSTAQIL o'lchanadi va o'z bali bor",
      "Har tahlil tarixda qoladi, oldingisi bilan solishtiriladi",
      "Xulosa emas, aniq ko'rsatma: nimani qo'shish kerak",
    ],
    shot: "/shots/seo-audit.jpg",
    mobileShot: "/shots/m/seo-audit.png",
    url: "estats.uz/seo",
    alt: "SEO audit: ball, tahlillar tarixi va bo'limlar bo'yicha xulosalar",
  },
  {
    question: "Qancha talab qo'ldan ketyapti?",
    title: "Qancha talab qo'ldan ketyapti?",
    body:
      "Yadrodagi har bir ibora Uzum qidiruvida o'lchanadi: ortida qancha buyurtma " +
      "va sharh turibdi, nechta raqobatchi chiqadi. Ishlatilmagan iboralar ortidagi " +
      "savdo — bu qo'ldan ketayotgan pul.",
    points: [
      "Har ibora bo'yicha talab, raqobat va sharh soni",
      "Til bo'yicha ajratilgan: uz va ru alohida",
      "Nomda va tavsifda necha marta uchragani",
      "Eng foydali ishlatilmagan iboralar — ro'yxat boshida",
    ],
    shot: "/shots/keywords.jpg",
    mobileShot: "/shots/m/keywords.png",
    url: "estats.uz/seo",
    alt: "Kalit so'zlar yadrosi: qamrov, raqobat va ishlatilishi",
  },
  {
    question: "Qo'lda qancha pul qoldi?",
    title: "Qo'lda qancha pul qoldi?",
    body:
      "Tushum foyda emas. Komissiya, logistika, Uzum yechimlari, doimiy xarajatlar " +
      "va tan narx ayrilgandan keyin qolgani — sof foyda. Tan narx FIFO bo'yicha, " +
      "ya'ni qaysi partiyadan sotilgani hisobga olinadi.",
    points: [
      "Har tovar bo'yicha: qanchadan keldi, nechtasi sotildi",
      "FIFO tan narx — partiya narxlari aralashtirilmaydi",
      "Tan narxi kiritilmagan donalar ochiq ko'rsatiladi",
      "7 / 30 / 90 kunlik davrlar va CSV eksport",
    ],
    shot: "/shots/pnl.jpg",
    mobileShot: "/shots/m/pnl.png",
    url: "estats.uz/pnl",
    alt: "Foyda va zarar: FIFO tan narx va sof foyda",
  },
  {
    question: "Uzum qancha ushlab qoldi?",
    title: "Uzum qancha ushlab qoldi?",
    body:
      "Komissiya, logistika, jarima va saqlash — har biri alohida qatorda. " +
      "Yalpi savdodan qancha ushlab qolinganini va qo'lingizga qancha " +
      "tushishini kunma-kun ko'rasiz.",
    points: [
      "Komissiya, logistika va boshqa yechimlar ajratilgan",
      "Buyurtma statuslari: yechishga tayyor, jarayonda, bekor",
      "Har bir jarima — sababi va sanasi bilan",
      "Kalkulyator: narxni o'zgartirib, foydani oldindan ko'rish",
    ],
    shot: "/shots/finance.jpg",
    mobileShot: "/shots/m/finance.png",
    url: "estats.uz/finance",
    alt: "Moliya: komissiya, logistika va sof to'lov",
  },
  {
    question: "Qaysi tovar qayerda e'lon qilingan?",
    title: "Qaysi tovar qayerda e'lon qilingan?",
    body:
      "Uzumdagi tovar Instagramda va Telegramda bormi — bitta jadvalda ko'rinadi. " +
      "Bitta tugma bilan hamma tarmoqqa joylanadi, e'lon fonda ketadi: " +
      "sahifani yopsangiz ham to'xtamaydi.",
    points: [
      "Instagram, Telegram, TikTok va LinkedIn — bitta joydan",
      "Qaysi tovar qayerda chiqqani belgilanadi",
      "Narx bilan yoki narxsiz — o'zingiz tanlaysiz",
      "E'lon fonda ketadi va uzilsa o'sha joyidan davom etadi",
    ],
    shot: "/shots/socials.jpg",
    mobileShot: "/shots/m/socials.png",
    url: "estats.uz/socials",
    alt: "Ijtimoiy tarmoqlar: tovar va e'lonlar bog'lanishi",
  },
  {
    question: "Qaysi tovardan boshlashim kerak?",
    title: "Qaysi tovardan boshlashim kerak?",
    body:
      "Do'kondagi hamma tovar bitta ro'yxatda, ball bo'yicha saralangan. " +
      "Eng past balli va eng ko'p talab qo'ldan ketayotgan tovar tepada — " +
      "ish shundan boshlanadi.",
    points: [
      "Hamma tovar bir ekranda, ball bilan",
      "Hammasini birdan tahlil qilish — fonda ketadi",
      "O'rtacha ball va umumiy qo'ldan ketayotgan talab",
      "Eng past balli tovar alohida ko'rsatiladi",
    ],
    shot: "/shots/seo-list.jpg",
    mobileShot: "/shots/m/seo-list.png",
    url: "estats.uz/seo",
    alt: "SEO audit ro'yxati: hamma tovar ball bo'yicha",
  },
];

/**
 * Sotuvchi beradigan savollar — javobi mahsulotning o'z ekranida.
 *
 * "Imkoniyatlar ro'yxati" o'rniga savol tanlangan: odam funksiya
 * qidirmaydi, o'z savoliga javob qidiradi. Tanlangan savol darhol
 * o'sha ekranni ko'rsatadi.
 */
export function QuestionsSection() {
  const [active, setActive] = React.useState(0);
  const current = QUESTIONS[active];

  return (
    <section id="imkoniyatlar" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Sotuvchining savollari
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Har kuni beriladigan savollarga tayyor javob
        </h2>
        <p className="mt-4 text-muted-foreground">
          Savolni tanlang — javobi qaysi ekranda turishini ko&apos;rasiz.
        </p>
      </div>

      <div className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {QUESTIONS.map((item, index) => (
          <button
            key={item.question}
            type="button"
            onClick={() => setActive(index)}
            aria-pressed={index === active}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              index === active
                ? "border-transparent bg-foreground text-background shadow-lg"
                : "bg-card hover:border-primary/30 hover:bg-muted/50"
            )}
          >
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-widest",
                index === active ? "text-background/60" : "text-muted-foreground"
              )}
            >
              Savol {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-sm font-medium">{item.question}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <div className="grid items-center gap-8 p-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:p-10">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">{current.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
            <ul className="mt-6 space-y-2.5">
              {current.points.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <BrowserFrame
            key={current.shot}
            src={current.shot}
            mobileSrc={current.mobileShot}
            alt={current.alt}
            url={current.url}
            className="shadow-xl"
            sizes="(max-width: 1024px) 100vw, 640px"
          />
        </div>
      </div>
    </section>
  );
}
