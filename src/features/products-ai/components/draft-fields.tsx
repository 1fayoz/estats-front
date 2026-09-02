"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AuditPanel } from "@/features/products-ai/components/audit-panel";
import { CategoryPicker } from "@/features/products-ai/components/category-picker";
import { ImagePanel } from "@/features/products-ai/components/image-panel";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

/**
 * Tahrirlanadigan maydonlar. Modal ushlab turadi, chunki
 * "Saqlash" tugmasi oynaning ost qismida — Bitrix naqshi.
 */
export interface DraftForm {
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  mxik: string;
  suggestedPrice: number;
}

export function initialForm(draft: AiDraft): DraftForm {
  return {
    titleUz: draft.titleUz ?? "",
    titleRu: draft.titleRu ?? "",
    descriptionUz: draft.descriptionUz ?? "",
    descriptionRu: draft.descriptionRu ?? "",
    mxik: draft.mxik ?? "",
    suggestedPrice: draft.suggestedPrice ?? 0,
  };
}

export type DraftTabKey =
  | "general" | "ru" | "images" | "attrs" | "keywords" | "market" | "audit";

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
      key: "audit",
      label: "Tayyorlik",
      count: draft?.audit ? draft.audit.blocking || undefined : undefined,
      ready: Boolean(draft?.audit),
      color: "var(--bad)",
    },
  ];

  return (
    <div className="-mx-1 flex flex-wrap items-center gap-1 overflow-x-auto">
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          disabled={!item.ready}
          onClick={() => onTab(item.key)}
          className={cn(
            "whitespace-nowrap rounded-md px-3 py-1.5 text-[15px] transition-colors",
            tab === item.key
              ? "bg-primary/10 text-primary"
              : "text-[color:var(--air-head)] hover:bg-black/[.04]",
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
  if (tab === "images") {
    return <ImagePanel draft={draft} onChange={onChange} locked={locked} />;
  }

  if (tab === "attrs") {
    return Object.keys(draft.attributes).length ? (
      <dl className="divide-y text-sm">
        {Object.entries(draft.attributes).map(([name, value]) => (
          <div key={name} className="flex justify-between gap-4 py-2">
            <dt className="text-muted-foreground">{name}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    ) : (
      <Empty />
    );
  }

  if (tab === "keywords") {
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
    return <AuditPanel audit={draft.audit} />;
  }

  if (tab === "market") {
    return draft.market?.rivals.length ? (
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[color:var(--air-line)] text-[11px] uppercase text-[color:var(--air-head)]">
            <th className="py-2 text-left font-semibold">Tovar</th>
            <th className="py-2 text-right font-semibold">Buyurtma</th>
            <th className="py-2 text-right font-semibold">Narx</th>
          </tr>
        </thead>
        <tbody>
          {draft.market.rivals.map((rival, index) => (
            <tr
              key={`${rival.url}-${index}`}
              className="border-b border-[color:var(--air-line)] last:border-0"
            >
              <td className="max-w-0 truncate py-2 pr-3">
                {rival.url ? (
                  <a
                    href={rival.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {rival.title}
                  </a>
                ) : (
                  rival.title
                )}
              </td>
              <td className="py-2 text-right tabular-nums">{formatNumber(rival.orders)}</td>
              <td className="py-2 text-right tabular-nums">
                {rival.price ? formatNumber(rival.price) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <Empty />
    );
  }

  const uz = tab === "general";
  return (
    <div className="space-y-4">
      {/*
        Turkum ENG TEPADA va faqat o'zbekcha tabda: u kartochkaning
        matnidan oldin keladigan qaror — noto'g'ri turkum matn
        qanchalik yaxshi bo'lsa ham kartochkani ko'rinmas qiladi.
        Joylashni ham to'sadi, shuning uchun sotuvchi uni birinchi
        ko'rishi kerak, oxirida emas.
      */}
      {uz && <CategoryPicker draft={draft} locked={locked} onDraft={onChange} />}
      <div>
        <label className="air-label">Nom {uz ? "(o'zbekcha)" : "(ruscha)"}</label>
        <input
          className="air-input"
          value={uz ? form.titleUz : form.titleRu}
          disabled={locked}
          onChange={(e) =>
            onForm((f) => ({ ...f, [uz ? "titleUz" : "titleRu"]: e.target.value }))
          }
        />
      </div>
      <div>
        <label className="air-label">Tavsif {uz ? "(o'zbekcha)" : "(ruscha)"}</label>
        <textarea
          className="air-input"
          value={uz ? form.descriptionUz : form.descriptionRu}
          disabled={locked}
          onChange={(e) =>
            onForm((f) => ({
              ...f,
              [uz ? "descriptionUz" : "descriptionRu"]: e.target.value,
            }))
          }
          rows={9}
        />
      </div>

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
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <p className="rounded-lg border border-dashed border-[color:var(--air-ctl-line)] p-6 text-center text-sm text-[color:var(--air-label)]">
      Quvur bu qadamga hali yetmadi.
    </p>
  );
}
