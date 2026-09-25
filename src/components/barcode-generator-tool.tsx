"use client";

import React, { useState, useRef } from "react";
import {
  Printer,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  Info,
  Layers,
  HelpCircle,
} from "lucide-react";
import { BarcodeSvg } from "@/components/barcode-svg";
import { generateRandomBarcode } from "@/lib/barcode";
import { toast } from "sonner";

export type BarcodeToolLocale = "uz" | "ru" | "en";

interface LabelPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

const PRESETS: Record<BarcodeToolLocale, LabelPreset[]> = {
  uz: [
    {
      id: "58x40",
      name: "58 × 40 mm (Standart)",
      widthMm: 58,
      heightMm: 40,
      description: "Uzum Market va Wildberries uchun eng ommabop termo-etiketka",
    },
    {
      id: "43x25",
      name: "43 × 25 mm (Kichik)",
      widthMm: 43,
      heightMm: 25,
      description: "Aksessuarlar, kosmetika va mayda tovarlar uchun",
    },
    {
      id: "58x60",
      name: "58 × 60 mm (Batafsil)",
      widthMm: 58,
      heightMm: 60,
      description: "Tarkibi va ishlab chiqaruvchi ma'lumotlari ko'p bo'lgan tovarlar uchun",
    },
    {
      id: "75x120",
      name: "75 × 120 mm (Korobka / FBO)",
      widthMm: 75,
      heightMm: 120,
      description: "Omborga topshiriladigan umumiy quti yoki postavka uchun",
    },
  ],
  ru: [
    {
      id: "58x40",
      name: "58 × 40 мм (Стандарт)",
      widthMm: 58,
      heightMm: 40,
      description: "Самый популярный размер для Uzum Market и Wildberries",
    },
    {
      id: "43x25",
      name: "43 × 25 мм (Малый)",
      widthMm: 43,
      heightMm: 25,
      description: "Для косметики, бижутерии и мелких аксессуаров",
    },
    {
      id: "58x60",
      name: "58 × 60 мм (Подробный)",
      widthMm: 58,
      heightMm: 60,
      description: "Для товаров с расширенным описанием состава и импортера",
    },
    {
      id: "75x120",
      name: "75 × 120 мм (Короб / FBO)",
      widthMm: 75,
      heightMm: 120,
      description: "Для маркировки коробов поставки на склад маркетплейса",
    },
  ],
  en: [
    {
      id: "58x40",
      name: "58 × 40 mm (Standard)",
      widthMm: 58,
      heightMm: 40,
      description: "Most popular thermal label for Uzum and Wildberries",
    },
    {
      id: "43x25",
      name: "43 × 25 mm (Small)",
      widthMm: 43,
      heightMm: 25,
      description: "For small jewelry, accessories, and cosmetics",
    },
    {
      id: "58x60",
      name: "58 × 60 mm (Detailed)",
      widthMm: 58,
      heightMm: 60,
      description: "For goods with detailed composition or importer details",
    },
    {
      id: "75x120",
      name: "75 × 120 mm (Box / FBO)",
      widthMm: 75,
      heightMm: 120,
      description: "For shipping containers and FBO batch delivery boxes",
    },
  ],
};

const UI_TEXTS = {
  uz: {
    title: "Uzum Market va Wildberries uchun Bepul Shtrix-kod & Etiketka Generatori",
    subtitle:
      "Termoprinterlar (Xprinter, HPRT, Godex) uchun 58×40 mm, 43×25 mm va 75×120 mm o'lchamdagi tovar etiketkalarini onlayn generatsiya qiling va chop eting.",
    labelSettings: "Etiketka ma'lumotlari",
    presetLabel: "Etiketka o'lchami",
    titleInput: "Mahsulot nomi",
    titlePlaceholder: "Masalan: Erkaklar futbolkasi oversize paxta",
    skuInput: "Artikul / SKU",
    skuPlaceholder: "TSH-BLK-XL",
    barcodeInput: "Shtrix-kod (Barcode)",
    generateNew: "Yangi kod",
    variantInput: "Rang / O'lcham (Ixtiyoriy)",
    variantPlaceholder: "Qora, XL",
    priceInput: "Narxi (Ixtiyoriy)",
    pricePlaceholder: "149 000 so'm",
    originInput: "Ishlab chiqarilgan mamlakat",
    originPlaceholder: "O'zbekiston",
    quantityInput: "Chop etish nusxasi soni",
    previewTitle: "Jonli Etiketka Ko'rinishi (Termo-stiker)",
    printBtn: "Chop etish (Termoprinter)",
    copyBtn: "Kodni nusxalash",
    copied: "Nusxalandi!",
    rulesTitle: "Uzum Market va Wildberries etiketka talablari",
    rules: [
      "Shtrix-kod Code-128 yoki EAN-13 formatida aniq va kontrastli bo'lishi shart.",
      "Uzum Market uchun tavsiya etiladigan standart etiketka o'lchami: 58×40 mm.",
      "Etiketkada mahsulot nomi, artikul, shtrix-kod va ishlab chiqaruvchi ko'rsatilishi shart.",
      "Termo-etiketka tovarning zavod qadog'iga yoki shaffof ziplock paketiga yopishtiriladi.",
    ],
  },
  ru: {
    title: "Бесплатный Генератор Штрихкодов и Термоэтикеток для Uzum и Wildberries",
    subtitle:
      "Создавайте и печатайте этикетки 58×40 мм, 43×25 мм и 75×120 мм для термопринтеров (Xprinter, HPRT, TSC) онлайн без регистрации.",
    labelSettings: "Параметры этикетки",
    presetLabel: "Размер этикетки",
    titleInput: "Наименование товара",
    titlePlaceholder: "Например: Футболка мужская оверсайз хлопок",
    skuInput: "Артикул / SKU",
    skuPlaceholder: "TSH-BLK-XL",
    barcodeInput: "Штрихкод (Barcode)",
    generateNew: "Сгенерировать код",
    variantInput: "Цвет / Размер (Опционально)",
    variantPlaceholder: "Черный, XL",
    priceInput: "Цена (Опционально)",
    pricePlaceholder: "149 000 сум",
    originInput: "Страна производства",
    originPlaceholder: "Узбекистан",
    quantityInput: "Количество копий на печать",
    previewTitle: "Предпросмотр термоэтикетки",
    printBtn: "Печать на термопринтере",
    copyBtn: "Скопировать штрихкод",
    copied: "Скопировано!",
    rulesTitle: "Требования к маркировке товаров Uzum Market и Wildberries",
    rules: [
      "Штрихкод должен быть контрастным в формате Code-128 или EAN-13.",
      "Рекомендуемый стандартный размер для Uzum Market: 58×40 мм.",
      "На этикетке обязательно наличие наименования, артикула, штрихкода и страны производства.",
      "Термоэтикетка наклеивается на индивидуальную упаковку (зип-пакет или коробку).",
    ],
  },
  en: {
    title: "Free Barcode & Thermal Label Generator for Marketplace Sellers",
    subtitle:
      "Generate and print 58×40 mm, 43×25 mm, and 75×120 mm thermal labels for Uzum Market, Wildberries, and Ozon online.",
    labelSettings: "Label Details",
    presetLabel: "Label Preset Size",
    titleInput: "Product Title",
    titlePlaceholder: "e.g. Men's Oversized Cotton T-Shirt",
    skuInput: "SKU / Article Number",
    skuPlaceholder: "TSH-BLK-XL",
    barcodeInput: "Barcode Value",
    generateNew: "Auto-Generate",
    variantInput: "Color / Size (Optional)",
    variantPlaceholder: "Black, XL",
    priceInput: "Price (Optional)",
    pricePlaceholder: "149,000 UZS",
    originInput: "Country of Origin",
    originPlaceholder: "Uzbekistan",
    quantityInput: "Print Quantity",
    previewTitle: "Live Thermal Label Preview",
    printBtn: "Print to Thermal Printer",
    copyBtn: "Copy Barcode",
    copied: "Copied!",
    rulesTitle: "Marketplace Labeling Compliance Guidelines",
    rules: [
      "Barcodes must be sharp and easily scannable in Code-128 or EAN-13 format.",
      "The official standard size for Central Asian marketplaces is 58×40 mm.",
      "Labels must clearly state product title, SKU, scannable barcode, and country of origin.",
      "Affix thermal labels directly to outer transparent poly bags or individual boxes.",
    ],
  },
};

export function BarcodeGeneratorTool({ locale = "uz" }: { locale?: BarcodeToolLocale }) {
  const t = UI_TEXTS[locale] || UI_TEXTS.uz;
  const presets = PRESETS[locale] || PRESETS.uz;

  const [selectedPreset, setSelectedPreset] = useState<string>("58x40");
  const [productTitle, setProductTitle] = useState<string>(
    locale === "ru"
      ? "Футболка мужская оверсайз хлопок"
      : locale === "en"
      ? "Men's Oversized Cotton T-Shirt"
      : "Erkaklar futbolkasi oversize paxta"
  );
  const [sku, setSku] = useState<string>("TSH-BLK-XL");
  const [barcode, setBarcode] = useState<string>("2008492019482");
  const [variant, setVariant] = useState<string>(
    locale === "ru" ? "Черный, XL" : locale === "en" ? "Black, XL" : "Qora, XL"
  );
  const [price, setPrice] = useState<string>("149 000 so'm");
  const [origin, setOrigin] = useState<string>(
    locale === "ru" ? "Узбекистан" : locale === "en" ? "Uzbekistan" : "O'zbekiston"
  );
  const [copies, setCopies] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const activePreset = presets.find((p) => p.id === selectedPreset) || presets[0];

  const handleGenerateBarcode = () => {
    const newCode = generateRandomBarcode();
    setBarcode(newCode);
    toast.success(
      locale === "ru"
        ? "Новый EAN-13 код сгенерирован!"
        : locale === "en"
        ? "New EAN-13 barcode generated!"
        : "Yangi EAN-13 shtrix-kod yaratildi!"
    );
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(barcode);
    setCopied(true);
    toast.success(t.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Intro Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          <span>{activePreset.name}</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t.subtitle}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left column: Form inputs */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <span>{t.labelSettings}</span>
            </h2>

            {/* Presets buttons */}
            <div className="mt-5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                {t.presetLabel}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPreset(p.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selectedPreset === p.id
                        ? "border-primary bg-primary/10 font-bold text-primary shadow-sm"
                        : "border-border bg-background/50 hover:bg-accent text-foreground text-sm"
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {p.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  {t.titleInput} *
                </label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    {t.skuInput} *
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder={t.skuPlaceholder}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-foreground">
                      {t.barcodeInput} *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="size-3" />
                      <span>{t.generateNew}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    {t.variantInput}
                  </label>
                  <input
                    type="text"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    placeholder={t.variantPlaceholder}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    {t.priceInput}
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={t.pricePlaceholder}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    {t.originInput}
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder={t.originPlaceholder}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    {t.quantityInput}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Label Visual Preview and Actions */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t.previewTitle}
                </span>
                <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {activePreset.widthMm} × {activePreset.heightMm} mm
                </span>
              </div>

              {/* Thermal Label Physical Card Simulation */}
              <div className="flex items-center justify-center p-4 bg-muted/40 rounded-2xl border border-dashed border-border/80">
                <div
                  ref={printAreaRef}
                  className="bg-white text-black rounded shadow-md border border-neutral-300 p-3 flex flex-col justify-between overflow-hidden select-none transition-all"
                  style={{
                    width: `${activePreset.widthMm * 5.2}px`,
                    minHeight: `${activePreset.heightMm * 5.2}px`,
                    maxWidth: "100%",
                  }}
                >
                  {/* Label Header */}
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-tight line-clamp-2 leading-tight">
                      {productTitle || "Mahsulot nomi"}
                    </div>
                    {(sku || variant) && (
                      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-700 mt-1 border-b border-neutral-200 pb-1">
                        <span>SKU: {sku}</span>
                        {variant && <span>{variant}</span>}
                      </div>
                    )}
                  </div>

                  {/* Centered Barcode SVG */}
                  <div className="my-2 flex flex-col items-center justify-center">
                    <BarcodeSvg
                      value={barcode}
                      height={selectedPreset === "43x25" ? 32 : 44}
                      barWidth={1.8}
                      showText={true}
                    />
                  </div>

                  {/* Label Footer */}
                  <div className="flex items-end justify-between text-[9px] text-neutral-600 border-t border-neutral-200 pt-1">
                    <span>Ishlab chiqaruvchi: {origin}</span>
                    {price && <span className="font-bold text-black">{price}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
                >
                  <Printer className="size-4" />
                  <span>
                    {t.printBtn} ({copies} dona)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBarcode}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Copy className="size-4 text-muted-foreground" />
                  )}
                  <span>{copied ? t.copied : t.copyBtn}</span>
                </button>
              </div>
            </div>

            {/* Quick Guidelines Card */}
            <div className="rounded-3xl border border-border/80 bg-background/50 p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3">
                <Info className="size-4 text-primary" />
                <span>{t.rulesTitle}</span>
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {t.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Container formatted strictly for Thermal Printers */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-print-container,
          #thermal-print-container * {
            visibility: visible;
          }
          #thermal-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .thermal-page-break {
            page-break-after: always;
            break-after: page;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>

      <div id="thermal-print-container" className="hidden print:block">
        {Array.from({ length: copies }).map((_, idx) => (
          <div
            key={idx}
            className="thermal-page-break bg-white text-black p-2 flex flex-col justify-between overflow-hidden"
            style={{
              width: `${activePreset.widthMm}mm`,
              height: `${activePreset.heightMm}mm`,
              boxSizing: "border-box",
            }}
          >
            <div>
              <div
                style={{ fontSize: "8pt", fontWeight: "bold", lineHeight: 1.1 }}
                className="line-clamp-2 uppercase"
              >
                {productTitle}
              </div>
              <div
                style={{ fontSize: "7pt", marginTop: "1mm" }}
                className="flex justify-between font-mono"
              >
                <span>SKU: {sku}</span>
                {variant && <span>{variant}</span>}
              </div>
            </div>

            <div className="my-auto flex flex-col items-center justify-center">
              <BarcodeSvg
                value={barcode}
                height={selectedPreset === "43x25" ? 28 : 38}
                barWidth={1.5}
                showText={true}
              />
            </div>

            <div
              style={{ fontSize: "6.5pt", borderTop: "0.5pt solid #ccc", paddingTop: "0.5mm" }}
              className="flex justify-between"
            >
              <span>Ishlab chiqaruvchi: {origin}</span>
              {price && <span style={{ fontWeight: "bold" }}>{price}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
