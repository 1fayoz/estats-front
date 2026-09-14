"use client";

import * as React from "react";
import { AlertTriangle, ExternalLink, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { AuditPanel } from "@/features/products-ai/components/audit-panel";
import {
  CharacteristicsSection,
  ColorsSection,
  CompetitorsSection,
  ComplianceSection,
  ImagesSection,
  MxikSection,
  PricingSection,
  SeoSection,
  UnderstandingSection,
} from "@/features/products-ai/components/intelligence-sections";
import { CategoryPicker } from "@/features/products-ai/components/category-picker";
import { ImagePanel } from "@/features/products-ai/components/image-panel";
import { MarketPanel } from "@/features/products-ai/components/market-panel";
import { PricePanel } from "@/features/products-ai/components/price-panel";
import { ApiError, fetchAiDraft, mediaUrl, rewriteAiTexts } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiContentKey, AiDraft, AiDraftPatch } from "@/lib/types";

/** Uzum nom maydonining chegarasi — undan keyingi harf yozilmaydi. */
const TITLE_MAX = 90;
/** «Tovar qisqacha tavsifi» chegarasi — oshsa Uzum formani to'xtatadi. */
const SHORT_MAX = 390;
/** Sotuvchi talabi: tavsifda kamida to'rtta rasm. */
const MIN_DESCRIPTION_IMAGES = 4;

const CONTENT_KEYS: AiContentKey[] = [
  "short_uz", "short_ru",
  "size_uz", "size_ru",
  "composition_uz", "composition_ru",
  "usage_uz", "usage_ru",
];

/**
 * Tahrirlanadigan maydonlar. Modal ushlab turadi, chunki
 * "Saqlash" tugmasi oynaning ost qismida — Bitrix naqshi.
 *
 * Bo'lim matnlari (`short_uz` …) TEKIS kalit: modal "o'zgarish bor"
 * ni har kalitni `!==` bilan solishtirib topadi, ichma-ich obyekt
 * esa har renderda yangi bo'lib, forma doim "saqlanmagan" ko'rinardi.
 */
export type DraftForm = {
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  mxik: string;
  suggestedPrice: number;
} & Record<AiContentKey, string>;

export function initialForm(draft: AiDraft): DraftForm {
  const content = draft.content ?? {};
  return {
    titleUz: draft.titleUz ?? "",
    titleRu: draft.titleRu ?? "",
    descriptionUz: draft.descriptionUz ?? "",
    descriptionRu: draft.descriptionRu ?? "",
    mxik: draft.mxik ?? "",
    suggestedPrice: draft.suggestedPrice ?? 0,
    ...(Object.fromEntries(CONTENT_KEYS.map((key) => [key, content[key] ?? ""])) as Record<AiContentKey, string>),
  };
}

/** Forma → PATCH yuklamasi: bo'limlar `content` ichida ketadi. */
export function formPatch(form: DraftForm): AiDraftPatch {
  const content = Object.fromEntries(CONTENT_KEYS.map((key) => [key, form[key]]));
  return {
    titleUz: form.titleUz,
    titleRu: form.titleRu,
    descriptionUz: form.descriptionUz,
    descriptionRu: form.descriptionRu,
    mxik: form.mxik,
    suggestedPrice: form.suggestedPrice,
    content,
  };
}

export type DraftTabKey =
  | "general" | "ru" | "images" | "attrs" | "keywords" | "market" | "pricing"
  | "audit";

/**
 * Tab qatori — namunadagi «Общие · Товары · Предложения …» kabi.
 *
 * Bo'sh tab ATAYLAB o'chirilgan holda qoladi, yashirilmaydi:
 * quvur hali u yergacha yetmagani ko'rinib tursin. Yashirilsa,
 * tablar quvur ishlagan sayin sakrab paydo bo'lardi va "u yerda
 * nima bor edi" degan savol tug'ilardi.
 */
export function DraftTabs({
  draft,
  tab,
  onTab,
}: {
  draft: AiDraft | null;
  tab: DraftTabKey;
  onTab: (tab: DraftTabKey) => void;
}) {
  // Har hisoblagichning O'Z rangi bor — hammasi bir xil xira
  // kulrang bo'lsa, tab qatori "bitta rangda" ko'rinardi.
  // `audit` alohida: uning soni BLOKLOVCHI kamchilik, shuning
  // uchun neytral emas, ogohlantirish (`--bad`) rangida.
  const tabs: { key: DraftTabKey; label: string; count?: number; ready: boolean; color?: string }[] = [
    { key: "general", label: "Umumiy", ready: true },
    { key: "ru", label: "Ruscha", ready: Boolean(draft?.titleRu) },
    {
      key: "images",
      label: "Rasmlar",
      count: (draft?.images.length ?? 0) + (draft?.sourceImages.length ?? 0),
      ready: Boolean(draft),
      color: "var(--primary)",
    },
    {
      key: "attrs",
      label: "Xususiyatlar",
      count: Object.keys(draft?.attributes ?? {}).length,
      ready: Object.keys(draft?.attributes ?? {}).length > 0,
      color: "var(--air-teal)",
    },
    {
      key: "keywords",
      label: "Kalit so'zlar",
      count: draft?.keywords.length ?? 0,
      ready: (draft?.keywords.length ?? 0) > 0,
      color: "var(--air-pink)",
    },
    {
      key: "market",
      label: "Bozor",
      count: draft?.market?.rivals.length ?? 0,
      ready: (draft?.market?.rivals.length ?? 0) > 0,
      color: "var(--warn)",
    },
    {
      key: "pricing",
      label: "Tan narx",
      ready: Boolean(draft),
      color: "var(--ok)",
    },
    {
      key: "audit",
      label: "Tayyorlik",
      count: draft?.audit ? draft.audit.blocking || undefined : undefined,
      ready: Boolean(draft?.audit),
      color: "var(--bad)",
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Tovar ma'lumotlari"
      className="flex gap-1 overflow-x-auto overscroll-x-contain rounded-xl bg-muted/60 p-1 [scrollbar-width:thin]"
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
        const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
        buttons[nextIndex]?.focus();
        buttons[nextIndex]?.click();
      }}
    >
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          id={`draft-tab-${item.key}`}
          aria-controls={`draft-panel-${item.key}`}
          aria-selected={tab === item.key}
          tabIndex={tab === item.key || (!tabs.some((candidate) => candidate.key === tab && candidate.ready) && item.key === "general") ? 0 : -1}
          disabled={!item.ready}
          onClick={() => onTab(item.key)}
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:text-[13px]",
            tab === item.key
              ? "bg-[color:var(--air-card)] text-[color:var(--ok)] shadow-sm"
              : "text-muted-foreground hover:bg-[color:var(--air-card)] hover:text-foreground",
            !item.ready && "cursor-default text-[color:var(--air-label)] opacity-60 hover:bg-transparent",
          )}
        >
          {item.label}
          {item.count ? (
            <span
              className="ml-1 rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums"
              style={{ color: item.color, background: `color-mix(in oklab, ${item.color} 14%, transparent)` }}
            >
              {item.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * Tanlangan tabning ichi.
 *
 * AI matni bu yerda TAHRIRLANADI. U yaxshi boshlang'ich nuqta,
 * lekin oxirgi so'z sotuvchida: u tovarini AI'dan yaxshi biladi.
 */
export function DraftFields({
  draft,
  tab,
  form,
  onForm,
  locked,
  onChange,
}: {
  draft: AiDraft;
  tab: DraftTabKey;
  form: DraftForm;
  onForm: React.Dispatch<React.SetStateAction<DraftForm>>;
  locked: boolean;
  onChange: (draft: AiDraft) => void;
}) {
  // AI tadqiqoti qoralama BILAN keladi (alohida so'rov yo'q) —
  // u quvurning o'zi, alohida bo'lim emas.
  const ai = draft.intelligence ?? {};

  if (tab === "images") {
    return (
      <div className="space-y-3">
        <ImagePanel draft={draft} onChange={onChange} locked={locked} />
        {(ai.image_plan || ai.generated_images) && (
          <ImagesSection plan={ai.image_plan} generated={ai.generated_images} />
        )}
      </div>
    );
  }

  if (tab === "attrs") {
    const extra = (
      <>
        {ai.mxik && <MxikSection data={ai.mxik} />}
        {ai.characteristics && ai.characteristics.length > 0 && (
          <CharacteristicsSection items={ai.characteristics} />
        )}
      </>
    );
    return Object.keys(draft.attributes).length || ai.mxik ? (
      <div className="space-y-3">
        {Object.keys(draft.attributes).length > 0 && (
          <dl className="divide-y text-sm">
            {Object.entries(draft.attributes).map(([name, value]) => (
              <div key={name} className="flex justify-between gap-4 py-2">
                <dt className="text-muted-foreground">{name}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {extra}
      </div>
    ) : (
      <Empty />
    );
  }

  if (tab === "keywords") {
    if (ai.seo) {
      return (
        <div className="space-y-3">
          <SeoSection data={ai.seo} />
        </div>
      );
    }
    return draft.keywords.length ? (
      <div className="flex flex-wrap gap-1.5">
        {draft.keywords.map((word) => (
          <Badge key={word} variant="secondary" className="font-normal">
            {word}
          </Badge>
        ))}
      </div>
    ) : (
      <Empty />
    );
  }

  if (tab === "audit") {
    return (
      <div className="space-y-3">
        <AuditPanel audit={draft.audit} />
        {ai.compliance && <ComplianceSection data={ai.compliance} />}
      </div>
    );
  }

  if (tab === "market") {
    return (
      <div className="space-y-3">
        <MarketPanel draft={draft} locked={locked} onChange={onChange} />
        {ai.competitors && ai.competitors.length > 0 && (
          <CompetitorsSection items={ai.competitors} />
        )}
      </div>
    );
  }

  if (tab === "pricing") {
    return (
      <div className="space-y-3">
        <PricePanel draft={draft} locked={locked} onChange={onChange} />
        {ai.pricing && <PricingSection data={ai.pricing} />}
      </div>
    );
  }

  const uz = tab === "general";
  const lang = uz ? "uz" : "ru";
  const set = (key: keyof DraftForm, value: string) => onForm((f) => ({ ...f, [key]: value }));
  const placed = draft.sectionImages ?? {};
  const descriptionImages = placed.description ?? [];
  return (
    <div className="space-y-4">
      {/* Tovar tahlili va rang — matndan OLDIN: ular matnning
          nimaga tayanganini ko'rsatadi. */}
      {uz && ai.understanding && <UnderstandingSection data={ai.understanding} />}
      {uz && ai.colors && <ColorsSection data={ai.colors} />}
      {/*
        Turkum ENG TEPADA va faqat o'zbekcha tabda: u kartochkaning
        matnidan oldin keladigan qaror — noto'g'ri turkum matn
        qanchalik yaxshi bo'lsa ham kartochkani ko'rinmas qiladi.
        Joylashni ham to'sadi, shuning uchun sotuvchi uni birinchi
        ko'rishi kerak, oxirida emas.
      */}
      {uz && <CategoryPicker draft={draft} locked={locked} onDraft={onChange} />}

      {/* Maydonlar Uzum formasi TARTIBIDA: nom → qisqacha tavsif →
          tavsif → o'lchamli setka → tarkib → yo'riqnoma. Sotuvchi
          shu yerda ko'rgani Uzum'da aynan shu joylarga tushadi. */}
      <CountedField
        label={`Tovar nomi ${uz ? "(o'zbekcha)" : "(ruscha)"}`}
        hint="Tovar turi + brend + model + muhim tavsif"
        value={uz ? form.titleUz : form.titleRu}
        max={TITLE_MAX}
        disabled={locked}
        onChange={(value) => set(uz ? "titleUz" : "titleRu", value)}
      />
      <CountedField
        label={`Tovar qisqacha tavsifi ${uz ? "(o'zbekcha)" : "(ruscha)"}`}
        hint="Qiziqtiruvchi jumla + raqobatchilardan olingan kalit so'zlar"
        value={form[`short_${lang}`]}
        max={SHORT_MAX}
        rows={4}
        disabled={locked}
        onChange={(value) => set(`short_${lang}`, value)}
      />
      <div>
        <label className="air-label">Tovar tavsifi {uz ? "(o'zbekcha)" : "(ruscha)"}</label>
        <textarea
          className="air-input"
          value={uz ? form.descriptionUz : form.descriptionRu}
          disabled={locked}
          onChange={(e) => set(uz ? "descriptionUz" : "descriptionRu", e.target.value)}
          rows={12}
        />
        <SectionThumbs
          label="Tavsifga qo'yiladigan rasmlar"
          images={descriptionImages}
          min={MIN_DESCRIPTION_IMAGES}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--air-line)] pt-4">
        <p className="text-xs text-[color:var(--air-label)]">
          Uzum formasining qo&apos;shimcha bo&apos;limlari — har birida matn va rasm.
        </p>
        {!locked && <RewriteTextsButton draft={draft} onChange={onChange} />}
      </div>
      <SectionField
        label={`Oʻlchamli setka ${uz ? "(o'zbekcha)" : "(ruscha)"}`}
        value={form[`size_${lang}`]}
        images={placed.size ?? []}
        disabled={locked}
        onChange={(value) => set(`size_${lang}`, value)}
      />
      <SectionField
        label={`Tarkib ${uz ? "(o'zbekcha)" : "(ruscha)"}`}
        value={form[`composition_${lang}`]}
        images={placed.composition ?? []}
        disabled={locked}
        onChange={(value) => set(`composition_${lang}`, value)}
      />
      <SectionField
        label={`Foydalanish boʻyicha yoʻriqnoma ${uz ? "(o'zbekcha)" : "(ruscha)"}`}
        value={form[`usage_${lang}`]}
        images={placed.usage ?? []}
        disabled={locked}
        onChange={(value) => set(`usage_${lang}`, value)}
      />

      {uz && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="air-label">Narx (so&apos;m)</label>
            <input
              className="air-input"
              type="number"
              value={form.suggestedPrice || ""}
              disabled={locked}
              onChange={(e) =>
                onForm((f) => ({ ...f, suggestedPrice: Number(e.target.value) || 0 }))
              }
            />
          </div>
          {/*
            MXIK — soliq hujjatiga tushadigan kod. AI faqat TAXMIN
            qiladi va noto'g'risi soliq muammosi degani, shuning
            uchun bu yerda har doim rasmiy katalog havolasi turadi.
          */}
          <div>
            <label className="air-label">MXIK kodi</label>
            <input
              className="air-input font-mono"
              value={form.mxik}
              disabled={locked}
              onChange={(e) => onForm((f) => ({ ...f, mxik: e.target.value }))}
              placeholder="17 xonali kod"
              inputMode="numeric"
            />
            <p className="mt-1.5 text-xs text-[color:var(--air-label)]">
              {draft.mxikName ? `Taxminiy turkum: ${draft.mxikName}. ` : ""}
              Kod <b>taxmin</b> — rasmiy katalogda tasdiqlang.
            </p>
            {draft.mxikCheckUrl && (
              <a
                href={draft.mxikCheckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> tasnif.soliq.uz da tekshirish
              </a>
            )}
          </div>
          {/* SKU nomdan yasaladi va qoralama raqami bilan noyob —
              `estats-publish` joylangan tovarni ro'yxatdan aynan
              shu kod bo'yicha topadi, shuning uchun qo'lda
              o'zgartirilmaydi. */}
          {draft.sku && (
            <div className="sm:col-span-2">
              <label className="air-label">SKU (Uzum 2-bosqichi, nomdan)</label>
              <p className="air-input flex items-center font-mono text-sm">{draft.sku}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Belgi hisoblagichli maydon — Uzum chegarasidan oshirib bo'lmaydi. */
function CountedField({
  label,
  hint,
  value,
  max,
  rows,
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  max: number;
  rows?: number;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const over = value.length > max;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="air-label">{label}</label>
        <span className={cn("text-xs tabular-nums", over ? "air-bad" : "text-[color:var(--air-label)]")}>
          {value.length}/{max}
        </span>
      </div>
      {rows ? (
        <textarea
          className="air-input"
          value={value}
          maxLength={max}
          rows={rows}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="air-input"
          value={value}
          maxLength={max}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <p className="mt-1 text-xs text-[color:var(--air-label)]">{hint}</p>}
    </div>
  );
}

function SectionField({
  label,
  value,
  images,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  images: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="air-label">{label}</label>
      <textarea
        className="air-input"
        value={value}
        rows={6}
        disabled={disabled}
        placeholder="Bo'sh — «Matnlarni AI bilan qayta yozish» bosing"
        onChange={(e) => onChange(e.target.value)}
      />
      <SectionThumbs label="Bo'limga qo'yiladigan rasm" images={images} min={1} />
    </div>
  );
}

/**
 * Bo'limga ketadigan rasmlar — joylashdan OLDIN ko'rinsin.
 * Kam bo'lsa ogohlantiriladi: sotuvchi talabi bo'yicha rasm majburiy.
 */
function SectionThumbs({ label, images, min }: { label: string; images: string[]; min: number }) {
  const short = images.length < min;
  return (
    <div className="mt-2">
      <p className={cn("mb-1.5 flex items-center gap-1 text-xs", short ? "air-warn" : "text-[color:var(--air-label)]")}>
        {short && <AlertTriangle className="h-3.5 w-3.5" />}
        {label}: {images.length}
        {short && ` — kamida ${min} ta kerak («Rasmlar» tabida qayta yasang)`}
      </p>
      {images.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {images.map((url, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${url}-${index}`}
              src={mediaUrl(url)}
              alt=""
              className="h-16 w-12 shrink-0 rounded-md border border-[color:var(--air-line)] object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Faqat matnlarni AI bilan qayta yozadi (rasm yasalmaydi — arzon).
 *
 * Bo'limlar qo'shilishidan OLDINGI qoralamalarda o'lchamli setka,
 * tarkib va yo'riqnoma bo'sh — joylash ularni talab qiladi. Tasdiqlangan
 * qoralamada bosqich o'zgarmaydi va modalning o'z so'rab turishi ishga
 * tushmaydi, shuning uchun natija shu yerda kutiladi.
 */
function RewriteTextsButton({ draft, onChange }: { draft: AiDraft; onChange: (draft: AiDraft) => void }) {
  const [busy, setBusy] = React.useState(false);
  const alive = React.useRef(true);
  React.useEffect(() => () => {
    alive.current = false;
  }, []);

  const run = async () => {
    setBusy(true);
    try {
      const started = await rewriteAiTexts(draft.id);
      // `failed` qoralama shu so'rovda `ready` ga qaytgan bo'lishi mumkin.
      onChange(started);
      toast.success("AI matnlarni yozmoqda — bir daqiqacha.");
      // Tugaganini `updatedAt` emas, `partial.at` bildiradi: natija va
      // uning holati BITTA yozuvda saqlanadi, ya'ni "yangilandi" deb
      // AI band bo'lgan urinishni ko'rsatib qo'ymaymiz.
      const previous = started.intelligence?.partial?.at;
      for (let i = 0; i < 45 && alive.current; i += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 4000));
        const fresh = await fetchAiDraft(draft.id).catch(() => null);
        const partial = fresh?.intelligence?.partial;
        if (fresh && partial && partial.at !== previous) {
          if (alive.current) onChange(fresh);
          if (partial.status === "failed") {
            toast.error(`Matn yozilmadi: ${partial.error || "AI javob bermadi"}. Kartochka o'zgarmadi — birozdan keyin qayta urining.`);
          } else {
            toast.success("Matnlar yangilandi.");
          }
          return;
        }
      }
      if (alive.current) toast.message("AI hali yozmoqda — birozdan keyin oynani yangilang.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className="air-btn-flat"
      onClick={run}
      disabled={busy}
      title="Nom, qisqacha tavsif, tavsif, o'lchamli setka, tarkib va yo'riqnomani kalit so'zlar bilan qayta yozadi. Rasm yasalmaydi."
    >
      {busy ? (
        <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" />
      ) : (
        <Wand2 className="mr-1.5 inline h-3.5 w-3.5" />
      )}
      Matnlarni AI bilan qayta yozish
    </button>
  );
}

function Empty() {
  return (
    <p className="rounded-lg border border-dashed border-[color:var(--air-ctl-line)] p-6 text-center text-sm text-[color:var(--air-label)]">
      Quvur bu qadamga hali yetmadi.
    </p>
  );
}
