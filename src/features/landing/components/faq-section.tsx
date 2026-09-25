import { ArrowUpRight, Plus } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import base from "./landing.module.css";
import styles from "./landing-chrome.module.css";

import { FaqSchema } from "@/components/seo/structured-data";

export type FaqLocale = "uz" | "ru" | "en";

const FAQ_BY_LOCALE = {
  uz: [
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
      answer: "AI avval nom, tavsif, rasmlar va boshqa ma’lumotlardan qoralama tayyorlaydi. Uni tekshirib, tahrirlab, tasdiqlaysiz. Kabinet ulanishi sozlangach, Uzum, Yandex, WB, Ozon kabi platformalarga joylashni boshlashingiz mumkin.",
    },
    {
      question: "Tovarlarni Telegram va Instagramga avtomatik joylash mumkinmi?",
      answer: "Ha! eStats orqali do'koningizdagi tovarlarni bitta klik bilan Telegram kanallaringizga va Instagram profilingizga chiroyli e'lon ko'rinishida yuborishingiz mumkin. Shuningdek, Boost TOP reklama kampaniyalari va DRR tahlilini ham bir joyda ko'rasiz.",
    },
    {
      question: "1C yoki MoySklad o'rniga eStats'dan foydalanish mumkinmi?",
      answer: "Albatta! 1C o'rnatish uchun qimmat serverlar va doimiy oylik oluvchi 1C dasturchisi talab qilinadi. eStats esa 1 daqiqada brauzerdan ulanadi, 10 barobar arzon va barcha partiyalar, FIFO tan narxi hamda marketpleys komissiyalarini avtomatlashtiradi.",
    },
  ],
  ru: [
    {
      question: "В чем разница между ZoomSelling и eStats?",
      answer: "ZoomSelling работает только с Uzum Market и показывает лишь ориентировочную выручку. eStats объединяет Uzum Market, Yandex Market, Wildberries и Ozon, рассчитывает реальную себестоимость партий по FIFO, строит финансовый отчет PnL с учетом всех комиссий и возвратов, ведет склад и генерирует AI описания карточек.",
    },
    {
      question: "Удобнее ли eStats, чем MPStats в Узбекистане?",
      answer: "Да. MPStats имеет очень высокие цены и не поддерживает Uzum Market. eStats полностью адаптирован под специфику Узбекистана, поддерживает местный эквайринг (Payme, Click, Uzum Pay) и стоит в разы выгоднее.",
    },
    {
      question: "Можно ли использовать сервис без токена API?",
      answer: "Да! Вы можете бесплатно анализировать категории, искать прибыльные ниши и исследовать продажи конкурентов без подключения личного кабинета. А для учета своих складов и PnL — подключить магазин в разделе Интеграции за 1 минуту.",
    },
    {
      question: "Как рассчитывается себестоимость партий по FIFO?",
      answer: "При поступлении каждой поставки фиксируется закупочная цена и количество. При продажах система списывает товар строго по правилу FIFO (First-In, First-Out), вычитая логистику, процент площадки и выводя настоящую чистую прибыль.",
    },
    {
      question: "Заменяет ли eStats программу 1С или МойСклад?",
      answer: "Да, eStats — это готовое облачное решение, не требующее серверов и программистов. Вы получаете контроль складов FBO/FBS, печать этикеток, партионный учет и аналитику в одном окне браузера или телефона.",
    },
    {
      question: "Есть ли бесплатные калькуляторы и сканер товаров?",
      answer: "Да, на платформе доступны бесплатный сканер товаров Uzum по ссылке, калькулятор комиссии Uzum Market 2026 и расчет юнит-экономики без обязательной регистрации.",
    },
  ],
  en: [
    {
      question: "Why choose eStats over ZoomSelling?",
      answer: "ZoomSelling only covers public Uzum Market sales estimates. eStats is an all-in-one ERP that unifies Uzum, Wildberries, Yandex Market, and Ozon, calculates GAAP-grade FIFO purchase costings, automates FBO/FBS stock sync, and writes bilingual AI listing copy.",
    },
    {
      question: "Can I use eStats without connecting an API token?",
      answer: "Yes! You can explore market niches, research competitor volume, and use our free calculators without linking your store token. To track internal FIFO margins, connect your store in 1 minute via the Integrations tab.",
    },
    {
      question: "How does batch FIFO inventory costing work?",
      answer: "When a new inventory batch arrives, you record quantity, unit cost, and date. Sales are matched against the earliest unconsumed batch (First-In, First-Out), subtracting marketplace fulfillment fees and referral commissions to display true net profit.",
    },
    {
      question: "Is eStats suitable for multi-warehouse and FBO/FBS operations?",
      answer: "Yes. eStats includes full inventory tracking with safety stock reorder thresholds, batch barcode labeling, and multi-channel synchronization across Uzum, WB, Yandex, and Ozon.",
    },
  ],
};

const FAQ_INTRO = {
  uz: {
    eyebrow: "SAVOL-JAVOB",
    title: "Boshlashdan oldin\nbilish kerak.",
    lead: "Ulanish, hisob-kitob va kundalik ish haqida ko‘p so‘raladigan savollar.",
    botText: "Telegram botini ochish",
  },
  ru: {
    eyebrow: "ВОПРОСЫ И ОТВЕТЫ",
    title: "Все, что нужно знать\nперед стартом.",
    lead: "Ответы на частые вопросы о подключении, учете себестоимости и тарифах.",
    botText: "Открыть Telegram бот",
  },
  en: {
    eyebrow: "FREQUENTLY ASKED QUESTIONS",
    title: "Everything you need\nto know before starting.",
    lead: "Common questions regarding store integrations, FIFO unit economics, and multi-channel features.",
    botText: "Launch Telegram Bot",
  },
};

export function FaqSection({ locale = "uz" }: { locale?: FaqLocale }) {
  const items = FAQ_BY_LOCALE[locale] || FAQ_BY_LOCALE.uz;
  const intro = FAQ_INTRO[locale] || FAQ_INTRO.uz;

  return (
    <section id="savollar" className={styles.faqSection} aria-labelledby="faq-heading">
      <FaqSchema items={items} />
      <div className={cn(base.container, styles.faqGrid)}>
        <div className={styles.faqIntro}>
          <p className={base.eyebrow}>{intro.eyebrow}</p>
          <h2 id="faq-heading" className={base.sectionTitle}>
            {intro.title.split("\n").map((line, idx) => (
              <span key={idx}>
                {line}
                <br />
              </span>
            ))}
          </h2>
          <p className={cn(base.lead, styles.faqLead)}>{intro.lead}</p>
          <a
            href={siteConfig.botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(base.textLink, styles.faqContact)}
          >
            {intro.botText}
            <ArrowUpRight size={17} aria-hidden="true" />
            <span className="sr-only"> (yangi oynada)</span>
          </a>
        </div>

        <div className={styles.faqList}>
          {items.map((item, index) => (
            <details key={item.question} name="landing-faq" className={styles.faqItem} open={index === 0}>
              <summary>
                <span>{item.question}</span>
                <Plus size={18} className={styles.faqToggle} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
