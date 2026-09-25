"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, CheckCircle2, AlertTriangle, XCircle, Sparkles, Upload, Check, Copy } from "lucide-react";

export type ImageCalcLocale = "uz" | "ru";

interface Texts {
  title: string;
  subtitle: string;
  selectMarket: string;
  inputWidth: string;
  inputHeight: string;
  presetTitle: string;
  resultStatusTitle: string;
  passedTitle: string;
  passedDesc: string;
  warningTitle: string;
  warningDesc: string;
  failedTitle: string;
  failedDesc: string;
  aspectRatioLabel: string;
  totalPixelsLabel: string;
  moderationChecklistTitle: string;
  checkWhiteBg: string;
  checkNoWatermark: string;
  checkTextLimit: string;
  checkPhotoCount: string;
  checkQuality: string;
  ctaButton: string;
}

const TEXTS: Record<ImageCalcLocale, Texts> = {
  uz: {
    title: "Marketpleys Foto va Infografika O'lchamlari Tekshirgichi",
    subtitle:
      "Uzum Market, Wildberries va Ozon moderatsiyasidan 100% o'tish uchun tovar rasmining eni, bo'yi, 3:4 proporsiyasi va ruxsat etilgan parametrlarini tekshiring.",
    selectMarket: "Marketpleysni tanlang",
    inputWidth: "Rasm eni (Width, px)",
    inputHeight: "Rasm bo'yi (Height, px)",
    presetTitle: "Tezkor standart o'lchamlar",
    resultStatusTitle: "Moderatsiya xulosasi",
    passedTitle: "Ideal! Moderatsiyadan 100% o'tadi",
    passedDesc: "Rasm o'lchami va 3:4 proporsiyasi platformaning barcha talablariga to'liq javob beradi.",
    warningTitle: "Diqqat: O'lcham kichikroq",
    warningDesc: "Proporsiya to'g'ri, lekin piksellar soni kam. Katta ekranlarda rasm xira ko'rinishi mumkin.",
    failedTitle: "Xato! Moderatsiyadan o'tmaydi",
    failedDesc: "Proporsiya 3:4 emas yoki ruxsat etilgan minimal o'lchamdan juda kichik. Tovar kartochkasi rad etiladi.",
    aspectRatioLabel: "Haqiqiy proporsiya",
    totalPixelsLabel: "Piksel aniqligi",
    moderationChecklistTitle: "Uzum Market moderatsiyasining 5 ta qat'iy qoidasi",
    checkWhiteBg: "Asosiy rasm (oblojka) toza oq yoki och kulrang fonda bo'lishi shart",
    checkNoWatermark: "Boshqa brend logotipi, raqobatchi belgisi yoki telefon raqami bo'lmasligi kerak",
    checkTextLimit: "Infografika yozuvlari rasm maydonining 25-30% idan oshmasligi kerak",
    checkPhotoCount: "Tovar kartochkasida kamida 3-5 ta turli rakursdagi rasm bo'lishi lozim",
    checkQuality: "Rasm aniq, yorug' va piksel buzilishlarisiz (blur bo'lmagan) bo'lishi shart",
    ctaButton: "Tovarlar SEO kartochkalarini eStats'da tayyorlash",
  },
  ru: {
    title: "Проверка Размеров Фото и Инфографики для Маркетплейсов",
    subtitle:
      "Онлайн валидатор фото и инфографики под строгие требования модерации Uzum Market, Wildberries и Ozon: проверка пропорции 3:4, разрешения и фона.",
    selectMarket: "Выберите маркетплейс",
    inputWidth: "Ширина изображения (px)",
    inputHeight: "Высота изображения (px)",
    presetTitle: "Популярные готовые стандарты",
    resultStatusTitle: "Статус проверки модерацией",
    passedTitle: "Идеально! 100% проходит модерацию",
    passedDesc: "Пропорция 3:4 и разрешение соответствуют всем регламентам платформы.",
    warningTitle: "Внимание: Разрешение ниже нормы",
    warningDesc: "Пропорция верная, но разрешение низкое. Фотография может выглядеть размытой в приложении.",
    failedTitle: "Отклонено! Не пройдет модерацию",
    failedDesc: "Пропорция не соответствует 3:4 или размер слишком мал. Модератор отклонит карточку товара.",
    aspectRatioLabel: "Фактическая пропорция",
    totalPixelsLabel: "Качество и четкость",
    moderationChecklistTitle: "5 главных правил модерации Uzum Market",
    checkWhiteBg: "Главное фото карточки строго на белом или нейтральном светло-сером фоне",
    checkNoWatermark: "Запрещены водяные знаки, контакты, телефоны и логотипы чужих брендов",
    checkTextLimit: "Текст инфографики не должен занимать более 20-30% площади изображения",
    checkPhotoCount: "В карточке должно быть от 3 до 5 качественных ракурсов и деталей",
    checkQuality: "Четкое студийное освещение без шумов, пикселей и размытия",
    ctaButton: "Создавать карточки с помощью AI в eStats",
  },
};

export function ImageSpecsCalculator({ locale = "uz" }: { locale?: ImageCalcLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  const [market, setMarket] = useState<"uzum" | "wb" | "ozon">("uzum");
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(1600);

  // Greatest common divisor to simplify ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const divisor = gcd(width, height);
  const ratioW = divisor > 0 ? Math.round(width / divisor) : 3;
  const ratioH = divisor > 0 ? Math.round(height / divisor) : 4;

  const decimalRatio = width > 0 && height > 0 ? (width / height) : 0.75;
  const isTargetRatio = Math.abs(decimalRatio - 0.75) <= 0.03; // ~ 3:4
  const isSquareRatio = Math.abs(decimalRatio - 1.0) <= 0.03; // 1:1

  // Validation
  let status: "passed" | "warning" | "failed" = "failed";
  if (market === "uzum" || market === "wb") {
    if (isTargetRatio) {
      if (width >= 1080 && height >= 1440) {
        status = "passed";
      } else {
        status = "warning";
      }
    } else {
      status = "failed";
    }
  } else if (market === "ozon") {
    if (isTargetRatio || isSquareRatio) {
      if (width >= 800 && height >= 800) {
        status = "passed";
      } else {
        status = "warning";
      }
    } else {
      status = "failed";
    }
  }

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <ImageIcon className="w-4 h-4" />
          <span>3:4 Proporsiya • 1200x1600 px • Moderatsiya Qoidalari</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
          {/* Marketplace toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-muted-foreground">
              {t.selectMarket}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMarket("uzum")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  market === "uzum"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Uzum Market (3:4)
              </button>
              <button
                type="button"
                onClick={() => setMarket("wb")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  market === "wb"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Wildberries (3:4)
              </button>
              <button
                type="button"
                onClick={() => setMarket("ozon")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  market === "ozon"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Ozon (1:1 / 3:4)
              </button>
            </div>
          </div>

          {/* Width & Height inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.inputWidth}
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={width}
                onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.inputHeight}
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={height}
                onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-muted-foreground">
              {t.presetTitle}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset(1200, 1600)}
                className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition text-center"
              >
                <span className="block font-bold">1200 × 1600</span>
                <span className="text-[10px] text-muted-foreground">Tavsiya (3:4)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1080, 1440)}
                className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition text-center"
              >
                <span className="block font-bold">1080 × 1440</span>
                <span className="text-[10px] text-muted-foreground">FHD (3:4)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(900, 1200)}
                className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition text-center"
              >
                <span className="block font-bold">900 × 1200</span>
                <span className="text-[10px] text-muted-foreground">WB Standart</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1000, 1000)}
                className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition text-center"
              >
                <span className="block font-bold">1000 × 1000</span>
                <span className="text-[10px] text-muted-foreground">Kvadrat (1:1)</span>
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div className="pt-3 border-t border-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t.moderationChecklistTitle}
            </h3>
            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t.checkWhiteBg}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t.checkNoWatermark}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t.checkTextLimit}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t.checkPhotoCount}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t.checkQuality}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results & Visualizer Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-card to-muted/40 border-2 border-primary/20 rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>{t.resultStatusTitle}</span>
            </h2>

            {/* Status Card */}
            <div
              className={`rounded-xl p-5 border space-y-2 ${
                status === "passed"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : status === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2.5 font-extrabold text-sm sm:text-base">
                {status === "passed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {status === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {status === "failed" && <XCircle className="w-5 h-5 text-rose-500" />}
                <span>
                  {status === "passed" ? t.passedTitle : status === "warning" ? t.warningTitle : t.failedTitle}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {status === "passed" ? t.passedDesc : status === "warning" ? t.warningDesc : t.failedDesc}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-background rounded-xl p-3 border border-border">
                <span className="block text-muted-foreground mb-0.5">{t.aspectRatioLabel}</span>
                <span className="text-base font-black text-foreground">
                  {isTargetRatio ? "3 : 4" : isSquareRatio ? "1 : 1" : `${ratioW} : ${ratioH}`}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {isTargetRatio ? "Uzum & WB standarti" : "Nostandart"}
                </span>
              </div>

              <div className="bg-background rounded-xl p-3 border border-border">
                <span className="block text-muted-foreground mb-0.5">{t.totalPixelsLabel}</span>
                <span className="text-base font-black text-foreground">
                  {((width * height) / 1000000).toFixed(1)} MP
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {width} × {height} px
                </span>
              </div>
            </div>

            {/* Aspect Ratio Visual Container */}
            <div className="flex items-center justify-center p-6 bg-background rounded-xl border border-border">
              <div
                style={{
                  width: `${Math.min(180, Math.max(90, (width / height) * 160))}px`,
                  height: "160px",
                }}
                className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all ${
                  status === "passed"
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : status === "warning"
                    ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                    : "border-rose-500 bg-rose-500/5 text-rose-600 dark:text-rose-400"
                }`}
              >
                <ImageIcon className="w-6 h-6 mb-1 opacity-70" />
                <span className="text-[11px] font-bold block">{width} × {height}</span>
                <span className="text-[9px] uppercase tracking-wider">{isTargetRatio ? "3:4" : "Nostandart"}</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm text-xs"
            >
              <span>{t.ctaButton}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
