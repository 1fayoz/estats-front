"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Plus,
  Trash2,
  FileText,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Building,
} from "lucide-react";
import { BarcodeSvg } from "@/components/barcode-svg";
import { toast } from "sonner";

export type FboActLocale = "uz" | "ru";

interface ActItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  quantity: number;
  price: number;
}

const DEMO_ITEMS: Record<FboActLocale, ActItem[]> = {
  uz: [
    {
      id: "1",
      name: "Erkaklar futbolkasi oversize paxta (Qora, L)",
      sku: "TSH-BLK-L",
      barcode: "2008492019482",
      quantity: 50,
      price: 120000,
    },
    {
      id: "2",
      name: "Simsiz quloqchinlar Bluetooth 5.3 (Oq)",
      sku: "EAR-WHT-PRO",
      barcode: "2007391028371",
      quantity: 30,
      price: 185000,
    },
    {
      id: "3",
      name: "Avtomobil telefon ushlagichi magnetsimon",
      sku: "CAR-HLD-01",
      barcode: "2009182736452",
      quantity: 40,
      price: 65000,
    },
  ],
  ru: [
    {
      id: "1",
      name: "Футболка мужская оверсайз хлопок (Черный, L)",
      sku: "TSH-BLK-L",
      barcode: "2008492019482",
      quantity: 50,
      price: 120000,
    },
    {
      id: "2",
      name: "Беспроводные наушники Bluetooth 5.3 (Белый)",
      sku: "EAR-WHT-PRO",
      barcode: "2007391028371",
      quantity: 30,
      price: 185000,
    },
    {
      id: "3",
      name: "Автомобильный магнитный держатель для телефона",
      sku: "CAR-HLD-01",
      barcode: "2009182736452",
      quantity: 40,
      price: 65000,
    },
  ],
};

const TEXTS = {
  uz: {
    title: "Uzum Market va Wildberries FBO/FBS Tovar Topshirish Dalolatnomasi (Akt)",
    subtitle:
      "Omborga tovar topshirish uchun rasmiy qabul qilish-topshirish dalolatnomasini (nakladnaya) onlayn to'ldiring va A4 formatda chop eting.",
    actNumberLabel: "Dalolatnoma (Akt) raqami",
    dateLabel: "Sana",
    sellerLabel: "Sotuvchi (Do'kon yoki YaTT/MChJ)",
    innLabel: "STIR (INN) / Telefon",
    marketplaceLabel: "Marketpleys ombori",
    schemeLabel: "Yetkazib berish sxemasi",
    boxCountLabel: "Qutilar / Joylar soni",
    tableHeaderName: "Mahsulot nomi",
    tableHeaderSku: "Artikul",
    tableHeaderBarcode: "Shtrix-kod",
    tableHeaderQty: "Miqdori (dona)",
    tableHeaderPrice: "Narxi (so'm)",
    tableHeaderTotal: "Jami (so'm)",
    addRow: "Yangi tovar qo'shish",
    printBtn: "A4 formatda chop etish (Print)",
    resetBtn: "Namunani tiklash",
    totalQty: "Jami tovarlar:",
    totalAmount: "Jami summa:",
    passedBy: "Topshirdi (Sotuvchi):",
    acceptedBy: "Qabul qildi (Ombor xodimi):",
    sign: "Imzo / Muhr",
    officialHeading: "TOVARLARNI QABUL QILISH-TOPSHIRISH DALOLATNOMASI (NAKLADNAYA)",
  },
  ru: {
    title: "Генератор Акта Приёма-Передачи (Накладной) FBO/FBS для Uzum и Wildberries",
    subtitle:
      "Создайте и распечатайте официальный акт приёма-передачи партии товаров на склад маркетплейса в формате A4 онлайн.",
    actNumberLabel: "Номер акта / накладной",
    dateLabel: "Дата поставки",
    sellerLabel: "Продавец (Магазин / ИП / ООО)",
    innLabel: "ИНН / Телефон селлера",
    marketplaceLabel: "Склад маркетплейса",
    schemeLabel: "Схема поставки",
    boxCountLabel: "Количество коробов (мест)",
    tableHeaderName: "Наименование товара",
    tableHeaderSku: "Артикул",
    tableHeaderBarcode: "Штрихкод",
    tableHeaderQty: "Кол-во (шт)",
    tableHeaderPrice: "Цена (сум)",
    tableHeaderTotal: "Сумма (сум)",
    addRow: "Добавить строку товара",
    printBtn: "Печать акта в A4 (Print)",
    resetBtn: "Сбросить к образцу",
    totalQty: "Всего товаров:",
    totalAmount: "Итоговая сумма:",
    passedBy: "Сдал (Представитель селлера):",
    acceptedBy: "Принял (Сотрудник склада):",
    sign: "Подпись / Печать",
    officialHeading: "АКТ ПРИЁМА-ПЕРЕДАЧИ ТОВАРОВ (НАКЛАДНАЯ ПОСТАВКИ)",
  },
};

export function FboActGenerator({ locale = "uz" }: { locale?: FboActLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  const todayStr = new Date().toISOString().split("T")[0];
  const [actNumber, setActNumber] = useState("AKT-2026/09-001");
  const [actDate, setActDate] = useState(todayStr);
  const [sellerName, setSellerName] = useState(locale === "ru" ? "ИП Smart Seller" : "Smart Trade MChJ");
  const [sellerInn, setSellerInn] = useState("309 847 122");
  const [marketplace, setMarketplace] = useState("Uzum Market (FBO - Markaziy ombor)");
  const [scheme, setScheme] = useState("FBO (Поставка на склад)");
  const [boxCount, setBoxCount] = useState(4);
  const [items, setItems] = useState<ActItem[]>(DEMO_ITEMS[locale] || DEMO_ITEMS.uz);

  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );

  const handleAddItem = () => {
    const newItem: ActItem = {
      id: Date.now().toString(),
      name: "",
      sku: "",
      barcode: "",
      quantity: 1,
      price: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      toast.error(locale === "ru" ? "Минимум одна строка!" : "Kamida 1 ta qator bo'lishi kerak!");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof ActItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Intro Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <FileText className="size-3.5" />
          <span>FBO &amp; FBS Document Tools</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Editor Panel (Controls) */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm print:hidden space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t.actNumberLabel}
            </label>
            <input
              type="text"
              value={actNumber}
              onChange={(e) => setActNumber(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">{t.dateLabel}</label>
            <input
              type="date"
              value={actDate}
              onChange={(e) => setActDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t.sellerLabel}
            </label>
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">{t.innLabel}</label>
            <input
              type="text"
              value={sellerInn}
              onChange={(e) => setSellerInn(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t.marketplaceLabel}
            </label>
            <input
              type="text"
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t.boxCountLabel}
            </label>
            <input
              type="number"
              min="1"
              value={boxCount}
              onChange={(e) => setBoxCount(parseInt(e.target.value) || 1)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic Items Table in Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {locale === "ru" ? "Список позиций в поставке" : "Topshirilayotgan tovarlar ro'yxati"}
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition"
            >
              <Plus className="size-3.5" />
              <span>{t.addRow}</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">№</th>
                  <th className="p-3">{t.tableHeaderName}</th>
                  <th className="p-3">{t.tableHeaderSku}</th>
                  <th className="p-3">{t.tableHeaderBarcode}</th>
                  <th className="p-3 w-20">{t.tableHeaderQty}</th>
                  <th className="p-3 w-28">{t.tableHeaderPrice}</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="p-3 font-bold text-muted-foreground">{idx + 1}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                        placeholder="Nomi..."
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => handleUpdateItem(item.id, "sku", e.target.value)}
                        placeholder="SKU"
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.barcode}
                        onChange={(e) => handleUpdateItem(item.id, "barcode", e.target.value)}
                        placeholder="Shtrix-kod"
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "quantity", parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-bold text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="1000"
                        value={item.price}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "price", parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-muted-foreground hover:text-rose-500 transition p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {t.totalQty} <strong className="text-foreground">{totalQuantity} dona</strong> |{" "}
            {t.totalAmount}{" "}
            <strong className="text-primary font-bold">
              {totalAmount.toLocaleString()} {locale === "ru" ? "сум" : "so'm"}
            </strong>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            <Printer className="size-4" />
            <span>{t.printBtn}</span>
          </button>
        </div>
      </div>

      {/* Printable Official A4 Document Simulation (Visible on Screen Preview and in Print) */}
      <div className="mt-10 bg-white text-black p-8 sm:p-12 rounded-2xl shadow-xl border border-neutral-300 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight uppercase leading-snug">
              {t.officialHeading}
            </h2>
            <div className="mt-1 text-xs font-mono font-bold text-neutral-800">
              № {actNumber} &nbsp;|&nbsp; {actDate}
            </div>
          </div>
          <div className="text-right">
            <BarcodeSvg value={actNumber} height={32} barWidth={1.4} showText={false} />
            <div className="text-[10px] font-mono text-neutral-600 mt-1">{actNumber}</div>
          </div>
        </div>

        {/* Requisites Meta Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs my-4 pb-4 border-b border-neutral-300">
          <div>
            <div>
              <span className="font-bold">{t.sellerLabel}:</span> {sellerName}
            </div>
            <div className="mt-1">
              <span className="font-bold">{t.innLabel}:</span> {sellerInn}
            </div>
          </div>
          <div className="text-right">
            <div>
              <span className="font-bold">{t.marketplaceLabel}:</span> {marketplace}
            </div>
            <div className="mt-1">
              <span className="font-bold">{t.boxCountLabel}:</span> {boxCount} ta o'rin
            </div>
          </div>
        </div>

        {/* Printable Items Table */}
        <table className="w-full text-left text-xs border-collapse my-4">
          <thead>
            <tr className="border-y-2 border-black bg-neutral-100 font-bold">
              <th className="py-2 px-2 border-r border-neutral-300 w-8 text-center">№</th>
              <th className="py-2 px-2 border-r border-neutral-300">{t.tableHeaderName}</th>
              <th className="py-2 px-2 border-r border-neutral-300 w-24">{t.tableHeaderSku}</th>
              <th className="py-2 px-2 border-r border-neutral-300 w-32">{t.tableHeaderBarcode}</th>
              <th className="py-2 px-2 border-r border-neutral-300 w-20 text-center">
                {t.tableHeaderQty}
              </th>
              <th className="py-2 px-2 text-right w-28">{t.tableHeaderTotal}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="py-2 px-2 border-r border-neutral-300 text-center font-bold">
                  {idx + 1}
                </td>
                <td className="py-2 px-2 border-r border-neutral-300 font-medium">{item.name}</td>
                <td className="py-2 px-2 border-r border-neutral-300 font-mono text-[11px]">
                  {item.sku}
                </td>
                <td className="py-2 px-2 border-r border-neutral-300 font-mono text-[11px]">
                  {item.barcode}
                </td>
                <td className="py-2 px-2 border-r border-neutral-300 text-center font-bold">
                  {item.quantity}
                </td>
                <td className="py-2 px-2 text-right font-medium">
                  {((Number(item.quantity) || 0) * (Number(item.price) || 0)).toLocaleString()}{" "}
                  {locale === "ru" ? "сум" : "so'm"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td colSpan={4} className="py-2 px-2 text-right">
                {locale === "ru" ? "ИТОГО ПО НАКЛАДНОЙ:" : "JAMI TOPSHIRILDI:"}
              </td>
              <td className="py-2 px-2 text-center text-sm">{totalQuantity} dona</td>
              <td className="py-2 px-2 text-right text-sm">
                {totalAmount.toLocaleString()} {locale === "ru" ? "сум" : "so'm"}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Signatures & Seal Section */}
        <div className="grid grid-cols-2 gap-8 text-xs mt-12 pt-6 border-t border-neutral-300">
          <div>
            <div className="font-bold uppercase tracking-wider mb-8">{t.passedBy}</div>
            <div className="border-b border-black w-48 mb-1"></div>
            <div className="text-[10px] text-neutral-500">{t.sign}</div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="font-bold uppercase tracking-wider mb-8">{t.acceptedBy}</div>
            <div className="border-b border-black w-48 mb-1"></div>
            <div className="text-[10px] text-neutral-500">{t.sign}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
