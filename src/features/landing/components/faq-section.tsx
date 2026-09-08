import { ArrowUpRight, Plus } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import base from "./landing.module.css";
import styles from "./landing-chrome.module.css";

const FAQ = [
  {
    question: "Ishni nimadan boshlayman?",
    answer: "Hisobingizga kiring va Integratsiyalar bo‘limida Uzum do‘koningizni ulang. Sotuvchi kabinetidagi API tokeni orqali tovarlar, sotuvlar va moliya ma’lumotlari yuklanadi. Qo‘shimcha imkoniyatlar uchun kerakli ulanishlar shu bo‘limda ko‘rsatiladi.",
  },
  {
    question: "Sof foyda qanday hisoblanadi?",
    answer: "Tovar tan narxini kirim qo‘shayotganda partiya bo‘yicha kiritasiz. Hisob FIFO usulida yuritiladi: avval kelgan partiya avval sotiladi. Tushum, tan narx, komissiya, logistika va kiritilgan doimiy xarajatlar foyda hisobida alohida ko‘rinadi.",
  },
  {
    question: "AI kartochkani Uzum’ga ham joylaydimi?",
    answer: "AI avval nom, tavsif, rasmlar va boshqa ma’lumotlardan qoralama tayyorlaydi. Uni tekshirib, tahrirlab, tasdiqlaysiz. Uzum kabinetining brauzer ulanishi sozlangach, joylashni boshlashingiz mumkin. Mavjud AI kartochkalarining matni va rasmlarini Uzum’da yangilash imkoniyati ham bor.",
  },
  {
    question: "O‘zbekcha va ruscha matn bilan ishlaydimi?",
    answer: "Ha. AI kartochkada nom va tavsifni o‘zbekcha va ruscha tayyorlash mumkin. SEO auditida ham ikki tildagi matn va qidiruv iboralari alohida ko‘rib chiqiladi. Tayyorlangan matnni qo‘llashdan oldin tekshirib, tahrirlashingiz mumkin.",
  },
  {
    question: "Ma’lumotlar qachon yangilanadi?",
    answer: "Yangilanish ulangan xizmat va ma’lumot turiga bog‘liq. Tegishli bo‘limlarda oxirgi sinxronlash holatini ko‘rish va yangilashni ishga tushirish mumkin. Tahlil va AI vazifalarining jarayoni ilovada ko‘rsatiladi.",
  },
  {
    question: "Bir nechta do‘kon bilan ishlash mumkinmi?",
    answer: "Ha. Bitta hisobga bir nechta do‘kon qo‘shishingiz mumkin. Ilovaning yuqori qismidan kerakli do‘konni tanlaysiz; tovarlar va hisobotlar tanlangan do‘kon bo‘yicha ko‘rsatiladi.",
  },
];

export function FaqSection() {
  return (
    <section id="savollar" className={styles.faqSection} aria-labelledby="faq-heading">
      <div className={cn(base.container, styles.faqGrid)}>
        <div className={styles.faqIntro}>
          <p className={base.eyebrow}>SAVOL-JAVOB</p>
          <h2 id="faq-heading" className={base.sectionTitle}>Boshlashdan oldin<br />bilish kerak.</h2>
          <p className={cn(base.lead, styles.faqLead)}>Ulanish, hisob-kitob va kundalik ish haqida ko‘p so‘raladigan savollar.</p>
          <a href={siteConfig.botUrl} target="_blank" rel="noopener noreferrer" className={cn(base.textLink, styles.faqContact)}>Telegram botini ochish<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (yangi oynada)</span></a>
        </div>

        <div className={styles.faqList}>
          {FAQ.map((item, index) => (
            <details key={item.question} name="landing-faq" className={styles.faqItem} open={index === 0}>
              <summary><span>{item.question}</span><Plus size={18} className={styles.faqToggle} aria-hidden="true" /></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
