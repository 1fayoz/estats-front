"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Calculator, BookOpen, Layers, ArrowRight, X, Sparkles, Building2, Store } from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "calc" | "guide" | "category" | "solution" | "market";
  href: string;
  keywords: string[];
}

const ITEMS_UZ: SearchItem[] = [
  // Calculators
  {
    id: "calc-abc",
    title: "ABC / XYZ Tovar Portfeli va Savdo Tahlili",
    description: "Pareto 80/20 bo'yicha lokomotiv tovarlar va o'lik zaxirani aniqlash",
    category: "calc",
    href: "/kalkulyator/abc-tahlil",
    keywords: ["abc", "xyz", "pareto", "matritsa", "lokomotiv", "tovar tahlili"],
  },
  {
    id: "calc-img",
    title: "Foto va Infografika O'lchamlari Tekshirgichi",
    description: "3:4 proporsiya, 1200x1600 px va Uzum moderatsiya qoidalari",
    category: "calc",
    href: "/kalkulyator/rasm-talablari",
    keywords: ["foto", "rasm", "infografika", "proporsiya", "3:4", "moderatsiya", "1200x1600"],
  },
  {
    id: "calc-cargo",
    title: "Xitoy (1688 / Kargo) Tan Narxi Kalkulyatori",
    description: "Yuan kursi, kargo ($/kg), qadoq va 1 dona tovar sof tan narxi",
    category: "calc",
    href: "/kalkulyator/kargo",
    keywords: ["xitoy", "kargo", "1688", "taobao", "tan narx", "yuan", "dostavka"],
  },
  {
    id: "calc-tax",
    title: "Marketpleys Soliq Kalkulyatori",
    description: "YaTT 4% aylanma soliq, ijtimoiy soliq va 1 mlrd QQS limiti",
    category: "calc",
    href: "/kalkulyator/soliq",
    keywords: ["soliq", "yatt", "mchj", "qqs", "aylanma", "bhm", "ofd"],
  },
  {
    id: "calc-fbo",
    title: "FBO / FBS Tovar Topshirish Akti Generatori",
    description: "Omborga yuk topshirish nakladnoyasi va A4 hujjatini tayyorlash",
    category: "calc",
    href: "/kalkulyator/fbo-akt",
    keywords: ["fbo", "fbs", "akt", "nakladnaya", "postavka", "ombor"],
  },
  {
    id: "calc-barcode",
    title: "Shtrix-kod & Termo-etiketka 58x40 Generatori",
    description: "Code-128 va EAN-13 termo-stikerlarni bepul generatsiya qilish",
    category: "calc",
    href: "/kalkulyator/shtrix-kod",
    keywords: ["shtrix", "barkod", "etiketka", "termo", "stiker", "58x40"],
  },
  {
    id: "calc-check",
    title: "Uzum Tovar Skaneri va Tekshiruvi",
    description: "Tovar linki orqali oylik sotuv, daromad va SEO audit",
    category: "calc",
    href: "/tekshirish",
    keywords: ["skaner", "tekshirish", "link", "sotuv", "audit", "tushum"],
  },
  {
    id: "calc-comm",
    title: "Uzum Komissiya Kalkulyatori",
    description: "Kategoriya komissiyasi, logistika va sof foydani hisoblash",
    category: "calc",
    href: "/kalkulyator/uzum-komissiya",
    keywords: ["komissiya", "uzum", "foyda", "kalkulyator"],
  },
  {
    id: "calc-unit",
    title: "Unit Iqtisodiyoti Kalkulyatori",
    description: "1 dona tovar marjasi, ROI % va zararsizlik nuqtasi",
    category: "calc",
    href: "/kalkulyator/unit-iqtisodiyot",
    keywords: ["unit", "marja", "roi", "iqtisodiyot", "breakeven"],
  },
  {
    id: "calc-returns",
    title: "Vozvrat va Zarar Kalkulyatori",
    description: "Qaytgan tovarlar logistikasi va zararlarini aniqlash",
    category: "calc",
    href: "/kalkulyator/vozvrat-zarari",
    keywords: ["vozvrat", "qaytish", "zarar", "brak", "yoqotish"],
  },
  {
    id: "calc-discount",
    title: "Chegirma va Narx Kalkulyatori",
    description: "Aksiya narxlari va chizilgan narx strategiyasi",
    category: "calc",
    href: "/kalkulyator/chegirma-narx",
    keywords: ["chegirma", "narx", "aksiya", "chizilgan"],
  },
  {
    id: "calc-rop",
    title: "Ombor Zaxirasini Rejalashtirish (ROP)",
    description: "Tovar tugab qolmasligi uchun xavfsiz zaxira va buyurtma vaqti",
    category: "calc",
    href: "/kalkulyator/ombor-zaxirasi",
    keywords: ["ombor", "zaxira", "rop", "reorder", "out of stock"],
  },
  {
    id: "calc-drr",
    title: "DRR va Reklama Rentabelligi Kalkulyatori",
    description: "Boost TOP xarajatlari va reklama samaradorligi (ROAS)",
    category: "calc",
    href: "/kalkulyator/drr",
    keywords: ["drr", "reklama", "roas", "boost top", "marketing"],
  },

  // Guides
  {
    id: "guide-hub",
    title: "Marketpleys Qo'llanmalari Markazi",
    description: "Barcha amaliy yo'riqnomalar va sotuvni oshirish sirlari",
    category: "guide",
    href: "/qollanma",
    keywords: ["qollanma", "darslik", "yoriqnoma", "baza"],
  },
  {
    id: "guide-open",
    title: "Uzum Marketda Do'kon Ochish (2026)",
    description: "Noldan do'kon ochish, YaTT, hujjatlar va birinchi savdo",
    category: "guide",
    href: "/qollanma/uzumda-dokon-ochish",
    keywords: ["dokon ochish", "registratsiya", "seller bolish"],
  },
  {
    id: "guide-seo",
    title: "Tovar Kartochkasi SEO Optimizatsiyasi",
    description: "Qidiruvda 1-o'ringa chiqish va konversiyani oshirish",
    category: "guide",
    href: "/qollanma/kartochka-toldirish",
    keywords: ["seo", "kartochka", "infografika", "tavsif", "sarlavha"],
  },
  {
    id: "guide-fbofbs",
    title: "FBO yoki FBS Modeli: Qaysi biri qulay?",
    description: "Ombor turlari, logistika tezligi va xarajatlar taqqoslovi",
    category: "guide",
    href: "/qollanma/fbo-fbs-farqi",
    keywords: ["fbo", "fbs", "farqi", "ombor"],
  },
  {
    id: "guide-boost",
    title: "Boost TOP Reklamasini To'g'ri Sozlash",
    description: "Budjetni tejab, maksimal buyurtma olish strategiyasi",
    category: "guide",
    href: "/qollanma/boost-top-sozlash",
    keywords: ["boost", "reklama sozlash", "klik", "stavka"],
  },
  {
    id: "guide-glossary",
    title: "Marketpleys Terminlari Lug'ati",
    description: "FIFO, FBO, FBS, DRR, SKU, Out of Stock, BuyBox tushunchalari",
    category: "guide",
    href: "/lugat",
    keywords: ["lugat", "atamalar", "terminlar", "sozlik"],
  },

  // Categories
  {
    id: "cat-elec",
    title: "Elektronika Toifasi Tahlili",
    description: "Gadjetlar, aksessuarlar, o'rtacha chek va raqobat darajasi",
    category: "category",
    href: "/kategoriya/elektronika",
    keywords: ["elektronika", "telefon", "gadjet", "naushnik"],
  },
  {
    id: "cat-cloth",
    title: "Kiyim va Poyabzal Toifasi Tahlili",
    description: "Mavsumiy talab, qaytarilish ulushi va oylik daromad",
    category: "category",
    href: "/kategoriya/kiyim-va-poyabzal",
    keywords: ["kiyim", "poyabzal", "moda", "razmer"],
  },
  {
    id: "cat-beauty",
    title: "Go'zallik va Parvarish Tahlili",
    description: "Kosmetika, parfyumeriya va terini parvarishlash tovarlari",
    category: "category",
    href: "/kategoriya/gozallik-va-parvarish",
    keywords: ["gozallik", "kosmetika", "krem", "parvarish"],
  },
  {
    id: "cat-home",
    title: "Uy-ro'zg'or va Oshxona Tahlili",
    description: "Doimiy talabdagi maishiy buyumlar va oshxona anjomlari",
    category: "category",
    href: "/kategoriya/uy-rozgor",
    keywords: ["uy", "oshxona", "rozgor", "idish"],
  },
  {
    id: "cat-auto",
    title: "Avtotovarlar Toifasi Tahlili",
    description: "Avto aksessuarlar, kimyo va salon jihozlari daromadlari",
    category: "category",
    href: "/kategoriya/avtotovarlar",
    keywords: ["avto", "mashina", "aksessuar", "moy"],
  },
  {
    id: "cat-kids",
    title: "Bolalar Tovarlari Tahlili",
    description: "O'yinchoqlar, tagliklar va bolalar parvarishi",
    category: "category",
    href: "/kategoriya/bolalar-tovarlari",
    keywords: ["bolalar", "oyinchoq", "pampers", "kiyimcha"],
  },

  // Marketplaces
  {
    id: "market-wb",
    title: "Wildberries O'zbekiston",
    description: "WB O'zbekiston analitikasi, sotuv va ombor hisobi",
    category: "market",
    href: "/bozorlar/wildberries",
    keywords: ["wildberries", "wb", "rossiya", "eksport"],
  },
  {
    id: "market-ym",
    title: "Yandex Market O'zbekiston",
    description: "Yandex Marketda tezkor yetkazish va savdo analitikasi",
    category: "market",
    href: "/bozorlar/yandex-market",
    keywords: ["yandex", "yandeks market"],
  },
  {
    id: "market-ozon",
    title: "Ozon O'zbekiston",
    description: "Ozon orqali xalqaro savdo va buyurtmalar nazorati",
    category: "market",
    href: "/bozorlar/ozon",
    keywords: ["ozon", "ozon uzbekistan"],
  },
];

const ITEMS_RU: SearchItem[] = [
  // Calculators
  {
    id: "calc-abc-ru",
    title: "ABC-Анализ товарной матрицы и склада",
    description: "Правило Парето 80/20: выявление локомотивов и неликвида",
    category: "calc",
    href: "/ru/kalkulyator/abc-tahlil",
    keywords: ["abc", "xyz", "парето", "матрица", "неликвид", "анализ склада"],
  },
  {
    id: "calc-img-ru",
    title: "Проверка размеров фото и инфографики",
    description: "Пропорция 3:4, разрешение 1200х1600 и правила модерации Uzum",
    category: "calc",
    href: "/ru/kalkulyator/rasm-talablari",
    keywords: ["фото", "инфографика", "размеры", "3:4", "модерация", "1200х1600"],
  },
  {
    id: "calc-cargo-ru",
    title: "Калькулятор карго и себестоимости из Китая",
    description: "Курс юаня, тариф карго за кг, упаковка и себестоимость в Ташкенте",
    category: "calc",
    href: "/ru/kalkulyator/kargo",
    keywords: ["китай", "карго", "1688", "таобао", "себестоимость", "юань", "доставка"],
  },
  {
    id: "calc-tax-ru",
    title: "Налоговый калькулятор маркетплейсов",
    description: "Налог 4% с оборота, социальный налог ИП и порог НДС 1 млрд",
    category: "calc",
    href: "/ru/kalkulyator/soliq",
    keywords: ["налоги", "ип", "ооо", "ндс", "оборот", "брв", "офд"],
  },
  {
    id: "calc-fbo-ru",
    title: "Генератор акта приёмки-передачи FBO/FBS",
    description: "Формирование накладной и товарного акта А4 для сдачи на склад",
    category: "calc",
    href: "/ru/kalkulyator/fbo-akt",
    keywords: ["фбо", "фбс", "акт", "накладная", "поставка", "склад"],
  },
  {
    id: "calc-barcode-ru",
    title: "Генератор штрихкодов и термоэтикеток 58х40",
    description: "Онлайн генератор стикеров Code-128 и EAN-13 под печать",
    category: "calc",
    href: "/ru/kalkulyator/shtrix-kod",
    keywords: ["штрихкод", "этикетка", "термоэтикетка", "наклейка", "58х40"],
  },
  {
    id: "calc-check-ru",
    title: "Сканер товаров Uzum Market по ссылке",
    description: "Мгновенный аудит выручки, остатков и SEO карточки",
    category: "calc",
    href: "/ru/tekshirish",
    keywords: ["сканер", "проверка", "ссылка", "выручка", "продажи"],
  },
  {
    id: "calc-comm-ru",
    title: "Калькулятор комиссии Uzum Market",
    description: "Расчет чистой прибыли с учетом комиссии и логистики",
    category: "calc",
    href: "/ru/kalkulyator/uzum-komissiya",
    keywords: ["комиссия", "узум", "прибыль", "калькулятор"],
  },
  {
    id: "calc-unit-ru",
    title: "Калькулятор юнит-экономики",
    description: "Маржа на 1 единицу товара, ROI и точка безубыточности",
    category: "calc",
    href: "/ru/kalkulyator/unit-iqtisodiyot",
    keywords: ["юнит", "экономика", "маржа", "roi", "безубыточность"],
  },
  {
    id: "calc-returns-ru",
    title: "Калькулятор убытков от возвратов",
    description: "Расчет прямых потерь от невыкупов и повреждений упаковки",
    category: "calc",
    href: "/ru/kalkulyator/vozvrat-zarari",
    keywords: ["возвраты", "невыкупы", "убытки", "брак", "потери"],
  },
  {
    id: "calc-discount-ru",
    title: "Калькулятор скидок и зачеркнутой цены",
    description: "Стратегия скидок без потери целевой рентабельности",
    category: "calc",
    href: "/ru/kalkulyator/chegirma-narx",
    keywords: ["скидки", "цена", "акции", "зачеркнутая цена"],
  },
  {
    id: "calc-rop-ru",
    title: "Калькулятор точки перезаказа склада (ROP)",
    description: "Предотвращение Out of Stock и страховой запас",
    category: "calc",
    href: "/ru/kalkulyator/ombor-zaxirasi",
    keywords: ["склад", "остатки", "rop", "запас", "out of stock"],
  },
  {
    id: "calc-drr-ru",
    title: "Калькулятор ДРР и рекламы Boost TOP",
    description: "Окупаемость рекламных расходов и расчет ROAS",
    category: "calc",
    href: "/ru/kalkulyator/drr",
    keywords: ["дрр", "реклама", "roas", "буст топ", "маркетинг"],
  },

  // Guides
  {
    id: "guide-hub-ru",
    title: "База знаний и руководства для селлеров",
    description: "Все статьи и инструкции по запуску и масштабированию продаж",
    category: "guide",
    href: "/ru/qollanma",
    keywords: ["база знаний", "руководство", "статьи", "инструкция"],
  },
  {
    id: "guide-open-ru",
    title: "Как открыть магазин на Uzum Market в 2026",
    description: "Пошаговый гид по регистрации ИП/ООО и первой поставке",
    category: "guide",
    href: "/ru/qollanma/uzumda-dokon-ochish",
    keywords: ["открыть магазин", "регистрация", "стать селлером"],
  },
  {
    id: "guide-seo-ru",
    title: "SEO оптимизация карточки товара Uzum",
    description: "Вывод товара в ТОП поиска и рост конверсии",
    category: "guide",
    href: "/ru/qollanma/kartochka-toldirish",
    keywords: ["сео", "карточка", "инфографика", "описание"],
  },
  {
    id: "guide-fbofbs-ru",
    title: "Сравнение моделей FBO и FBS",
    description: "Что выгоднее: отгрузка со склада маркетплейса или своего",
    category: "guide",
    href: "/ru/qollanma/fbo-fbs-farqi",
    keywords: ["фбо", "фбс", "сравнение", "склад"],
  },
  {
    id: "guide-boost-ru",
    title: "Настройка рекламы Boost TOP без слива",
    description: "Секреты эффективного продвижения и ставок",
    category: "guide",
    href: "/ru/qollanma/boost-top-sozlash",
    keywords: ["буст топ", "настройка рекламы", "ставки"],
  },
  {
    id: "guide-glossary-ru",
    title: "Словарь терминов электронной торговли",
    description: "Энциклопедия определений FIFO, FBO, FBS, DRR, SKU",
    category: "guide",
    href: "/ru/lugat",
    keywords: ["словарь", "термины", "определения", "глоссарий"],
  },

  // Categories
  {
    id: "cat-elec-ru",
    title: "Анализ категории Электроника",
    description: "Выручка, трендовые гаджеты и средний чек на Uzum Market",
    category: "category",
    href: "/ru/kategoriya/elektronika",
    keywords: ["электроника", "гаджеты", "смартфоны", "наушники"],
  },
  {
    id: "cat-cloth-ru",
    title: "Анализ категории Одежда и Обувь",
    description: "Сезонный спрос, процент возвратов и оборот ниши",
    category: "category",
    href: "/ru/kategoriya/kiyim-va-poyabzal",
    keywords: ["одежда", "обувь", "мода", "размеры"],
  },
  {
    id: "cat-beauty-ru",
    title: "Анализ категории Красота и Уход",
    description: "Косметика, парфюмерия и высокомаржинальные товары",
    category: "category",
    href: "/ru/kategoriya/gozallik-va-parvarish",
    keywords: ["красота", "косметика", "крем", "уход"],
  },
  {
    id: "cat-home-ru",
    title: "Анализ категории Товары для Дома",
    description: "Кухонные принадлежности, текстиль и декор",
    category: "category",
    href: "/ru/kategoriya/uy-rozgor",
    keywords: ["дом", "кухня", "уют", "посуда"],
  },
  {
    id: "cat-auto-ru",
    title: "Анализ категории Автотовары",
    description: "Автоаксессуары, химия и сезонные товары для авто",
    category: "category",
    href: "/ru/kategoriya/avtotovarlar",
    keywords: ["авто", "автотовары", "аксессуары", "масло"],
  },
  {
    id: "cat-kids-ru",
    title: "Анализ категории Детские Товары",
    description: "Игрушки, уход за детьми и развивающие товары",
    category: "category",
    href: "/ru/kategoriya/bolalar-tovarlari",
    keywords: ["дети", "детские товары", "игрушки", "памперсы"],
  },
];

export function CommandPalette({ locale = "uz" }: { locale?: "uz" | "ru" | "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const items = locale === "ru" ? ITEMS_RU : ITEMS_UZ;

  const placeholderText =
    locale === "ru"
      ? "Поиск калькулятора, категории, статьи... (нажмите Esc для выхода)"
      : "Kalkulyator, toifa yoki qo'llanmani qidiring... (Esc yopish)";

  // Filter items
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items.slice(0, 8); // show popular default suggestions
    }
    const q = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Global hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation within list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      router.push(filteredItems[selectedIndex].href);
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (category: SearchItem["category"]) => {
    switch (category) {
      case "calc":
        return <Calculator className="w-4 h-4 text-primary" />;
      case "guide":
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case "category":
        return <Layers className="w-4 h-4 text-sky-500" />;
      case "market":
        return <Store className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <>
      {/* Search trigger button in header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-border/80 bg-background/80 hover:bg-muted/60 text-xs text-muted-foreground hover:text-foreground transition shadow-sm"
        aria-label="Tezkor qidiruv (Cmd+K)"
      >
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="hidden md:inline font-medium">
          {locale === "ru" ? "Поиск..." : "Tezkor qidiruv..."}
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted border border-border text-muted-foreground">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleListKeyDown}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-background">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder={placeholderText}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 divide-y divide-border/40">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  {locale === "ru" ? "Ничего не найдено" : "Hech narsa topilmadi"}
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        router.push(item.href);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition ${
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-background border border-border shrink-0 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold truncate text-foreground">
                            {item.title}
                          </span>
                          {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>eStats Marketplace Intelligence</span>
              <div className="flex items-center gap-3">
                <span>↑↓ tanlash</span>
                <span>↵ ochish</span>
                <span>esc yopish</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
