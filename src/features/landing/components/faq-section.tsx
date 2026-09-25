import { ArrowUpRight, Plus } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import base from "./landing.module.css";
import styles from "./landing-chrome.module.css";

import { FaqSchema } from "@/components/seo/structured-data";

const FAQ = [
  {
    question: "ZoomSelling yoki eStats: qaysi birini tanlash kerak?",
    answer: "ZoomSelling faqat Uzum Market bilan cheklangan va unda haqiqiy partiyaviy FIFO tan narxi hamda ombor nazorati yo‘q. eStats esa Uzum Market, Yandex Market, Wildberries va Ozon kabi barcha bozorlarni birlashtiradi, aniq sof foyda (PnL) va zaxirani hisoblaydi, AI SEO bilan kartochka yozadi hamda tovarlarni bitta tugma bilan Telegram va Instagramga e'lon qiladi.",
  },
  {
    question: "MPStats o'rniga O'zbekistonda eStats ishlatish qulayroqmi?",
    answer: "Ha. MPStats juda qimmat va O'zbekistonning asosiy bozori hisoblangan Uzum Market ma'lumotlarini to'liq qamrab olmaydi. eStats esa Uzum Market va xalqaro bozorlarni (WB, Yandex, Ozon) to'liq qo'llab-quvvatlaydi, milliy to'lov tizimlari (Payme, Click, Uzum Pay) orqali ancha arzon tariflarda ishlaydi.",
  },
  {
    question: "Ishni nimadan boshlayman? Uzum tokensiz ishlatsa bo'ladimi?",
    answer: "Albatta! Siz tokenni kiritmasdan ham Bozor tahlili (/market), tovar qidiruvi, nishalar o'sishi va raqobatchilar tahlilidan bepul foydalanishingiz mumkin. O'z do'koningiz tovarlari, ombor qoldiqlari va moliyaviy hisobotlarni avtomatlashtirish uchun esa Integratsiyalar bo‘limida do‘koningizni bir daqiqada ulaysiz.",
  },
  {
    question: "Kirim-chiqim, tan narx va FIFO hisobi qanday yuritiladi?",
    answer: "Har bir kelgan tovar partiyasining miqdori va narxini kiritasiz. Mahsulot sotilganda hisob FIFO (First-In, First-Out) qoidasi bo'yicha yuritiladi: eng birinchi kirgan partiya birinchi bo'lib hisobdan chiqariladi. Natijada bozor komissiyasi, logistika, saqlash xarajatlari va QQS ayirilib, har bir tovarning haqiqiy sof foydasi aniqlanadi.",
  },
  {
    question: "Ombor qoldiqlari va partiyalar nazorati bormi?",
    answer: "Ha. eStats to'liq ombor (Warehouse ERP) moduliga ega. Qoldiqlar, partiyalar, SKU, tan narxsiz qolgan tovarlar hamda zaxirasi tugab borayotgan tovarlar bo'yicha avtomatik ogohlantirishlar beriladi. Shuningdek, bozorga bir xil tovar ikki marta qo'yilgan bo'lsa, ularning ombor qoldig'i birlashtiriladi.",
  },
  {
    question: "AI kartochkani marketpleyslarga ham joylaydimi?",
    answer: "AI avval nom, tavsif, rasmlar va boshqa ma’lumotlardan qoralama tayyorlaydi. Uni tekshirib, tahrirlab, tasdiqlaysiz. Kabinet ulanishi sozlangach, Uzum, Yandex, WB, Ozon kabi platformalarga joylashni boshlashingiz mumkin. Mavjud kartochkalarning matni va rasmlarini yangilash imkoniyati ham bor.",
  },
  {
    question: "Tovarlarni Telegram va Instagramga avtomatik joylash mumkinmi?",
    answer: "Ha! eStats orqali do'koningizdagi tovarlarni bitta klik bilan Telegram kanallaringizga va Instagram profilingizga chiroyli e'lon ko'rinishida yuborishingiz mumkin. Shuningdek, Boost TOP reklama kampaniyalari va DRR (reklama xarajati ulushi) tahlilini ham bir joyda ko'rasiz.",
  },
  {
    question: "O‘zbekcha va ruscha matn bilan ishlaydimi?",
    answer: "Ha. AI kartochkada nom va tavsifni o‘zbekcha va ruscha tayyorlash mumkin. SEO auditida ham ikki tildagi matn va qidiruv iboralari alohida ko‘rib chiqiladi. Tayyorlangan matnni qo‘llashdan oldin tekshirib, tahrirlashingiz mumkin.",
  },
  {
    question: "1C yoki MoySklad o'rniga eStats'dan foydalanish mumkinmi?",
    answer: "Albatta! 1C o'rnatish uchun qimmat serverlar va doimiy oylik oluvchi 1C dasturchisi talab qilinadi. eStats esa 1 daqiqada brauzerdan ulanadi, 10 barobar arzon va barcha partiyalar, FIFO tan narxi hamda marketpleys komissiyalarini avtomatlashtiradi.",
  },
  {
    question: "Bepul kalkulyatorlar (Uzum komissiyasi, Unit Economics, DRR) bormi?",
    answer: "Ha! eStats platformasida ro'yxatdan o'tmasdan turib foydalanish mumkin bo'lgan bepul onlayn kalkulyatorlar mavjud: Uzum komissiya kalkulyatori, Unit iqtisodiyoti marja/ROI kalkulyatori va Boost TOP DRR kalkulyatori.",
  },
  {
    question: "HunterSales yoki SellerFox bilan taqqoslaganda qanday farqlar bor?",
    answer: "HunterSales va SellerFox asosan tovar va nisha skaneri bilan cheklanadi. eStats esa tashqi bozor razvedkasidan tashqari: ombor partiyalari, buxgalteriya darajasidagi FIFO tan narx, sof foyda (PnL), AI tovar kartochkalari va Telegram/Instagram avtopostingni birlashtirgan to'liq ERP ekotizimdir.",
  },
  {
    question: "Bir nechta do‘kon bilan ishlash mumkinmi?",
    answer: "Ha. Bitta hisobga bir nechta do‘kon qo‘shishingiz mumkin. Ilovaning yuqori qismidan kerakli do‘konni tanlaysiz; tovarlar va hisobotlar tanlangan do‘kon bo‘yicha ko‘rsatiladi.",
  },
];

export function FaqSection() {
  return (
    <section id="savollar" className={styles.faqSection} aria-labelledby="faq-heading">
      <FaqSchema items={FAQ} />
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
